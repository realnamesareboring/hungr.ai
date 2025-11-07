/**
 * HungrAI.ai - OpenAI API Integration
 * Handles all AI-powered food recommendations
 */

class HungrAIAPI {
    constructor() {
        this.config = window.hungraiConfig || {};
        this.apiKey = this.getAPIKey();
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4';
        this.maxTokens = 1500;
        this.temperature = 0.7;
        this.timeout = this.config.apiTimeout || 30000;
        this.retryAttempts = this.config.retryAttempts || 3;
    }

    /**
     * Get API key from configuration
     */
    getAPIKey() {
        // Get API key from Jekyll configuration (passed via window.hungraiConfig)
        const apiKey = window.OPENAI_API_KEY || 
                      this.config.openaiApiKey ||
                      window.hungraiConfig?.openaiApiKey;
        
        if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'not-configured') {
            console.warn('OpenAI API key not configured');
            return null;
        }
        
        return apiKey;
    }

    /**
     * Build the AI prompt based on user preferences
     */
    buildPrompt(preferences) {
        const moodData = window.hungraiContent?.moods?.moods?.[preferences.mood] || {};
        const budgetLabels = ['Budget ($)', 'Moderate ($$)', 'Upscale ($$$)', 'Fine Dining ($$$$)'];
        const budgetText = budgetLabels[preferences.budget - 1] || 'Moderate ($$)';
        
        let prompt = `Based on the following user preferences, provide 3-4 food recommendations:\n\n`;
        prompt += `MOOD: ${preferences.mood || 'neutral'}\n`;
        prompt += `MOOD DESCRIPTION: ${moodData.description || 'General dining'}\n`;
        prompt += `PREFERRED FOOD THEMES: ${(moodData.food_themes || []).join(', ')}\n`;
        prompt += `LOCATION: ${preferences.location || 'not specified'}\n`;
        prompt += `PREFERENCE: ${preferences.vibe || 'cook'}\n`;
        prompt += `BUDGET: ${budgetText}\n`;
        prompt += `PEOPLE: ${preferences.people || '1'}\n`;
        prompt += `TIMING: ${preferences.time || 'now'}\n`;
        
        if (preferences.dietary && preferences.dietary.length > 0) {
            prompt += `DIETARY RESTRICTIONS: ${preferences.dietary.join(', ')}\n`;
        }
        
        prompt += `\nPlease respond with ONLY a JSON object in this exact format:\n`;
        prompt += `{\n`;
        prompt += `  "mood_summary": "Brief explanation of how the mood affects recommendations",\n`;
        prompt += `  "recommendations": [\n`;
        prompt += `    {\n`;
        prompt += `      "title": "Name of recipe or restaurant",\n`;
        prompt += `      "description": "Detailed description (50-80 words)",\n`;
        prompt += `      "type": "Recipe" or "Restaurant",\n`;
        prompt += `      "time": "prep/delivery time",\n`;
        prompt += `      "budget": "$", "$$", "$$$", or "$$$$",\n`;
        prompt += `      "why_perfect": "Why this matches their mood (20-30 words)"\n`;
        prompt += `    }\n`;
        prompt += `  ]\n`;
        prompt += `}\n\n`;
        
        prompt += `Focus on the emotional connection between food and mood. `;
        
        if (preferences.vibe === 'cook') {
            prompt += `Provide recipes they can make at home. `;
        } else if (preferences.vibe === 'order') {
            prompt += `Suggest restaurants/cuisines good for delivery. `;
        } else {
            prompt += `Recommend restaurants to visit. `;
        }
        
        prompt += `Consider their ${preferences.mood || 'current'} mood when selecting options that will enhance their emotional state.`;
        
        return prompt;
    }

    /**
     * Call OpenAI API with retry logic
     */
    async callAPI(preferences, attempt = 1) {
        if (!this.apiKey) {
            throw new Error('API_KEY_MISSING');
        }

        const prompt = this.buildPrompt(preferences);
        
        const payload = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert food and restaurant recommendation AI for hungrai.ai. Provide personalized, mood-based food recommendations in a specific JSON format. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: this.maxTokens,
            temperature: this.temperature
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload)
        };

        try {
            console.log(`API attempt ${attempt}:`, { preferences, prompt: prompt.substring(0, 200) + '...' });
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(this.baseURL, {
                ...requestOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            return this.parseResponse(data);
            
        } catch (error) {
            console.error(`API attempt ${attempt} failed:`, error);
            
            // Retry logic
            if (attempt < this.retryAttempts && error.name !== 'AbortError') {
                console.log(`Retrying in ${attempt * 1000}ms...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                return this.callAPI(preferences, attempt + 1);
            }
            
            throw error;
        }
    }

    /**
     * Parse and validate API response
     */
    parseResponse(apiResponse) {
        try {
            if (!apiResponse.choices || !apiResponse.choices[0] || !apiResponse.choices[0].message) {
                throw new Error('Invalid API response structure');
            }
            
            const content = apiResponse.choices[0].message.content;
            console.log('Raw API Content:', content);
            
            // Extract JSON from response
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}') + 1;
            
            if (jsonStart === -1 || jsonEnd === 0) {
                throw new Error('No JSON found in response');
            }
            
            const jsonString = content.substring(jsonStart, jsonEnd);
            const parsedData = JSON.parse(jsonString);
            
            // Validate required fields
            if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
                throw new Error('Invalid recommendations format');
            }
            
            // Ensure all recommendations have required fields
            parsedData.recommendations = parsedData.recommendations.map(rec => ({
                title: rec.title || 'Unnamed Recommendation',
                description: rec.description || 'No description available',
                type: rec.type || 'Recipe',
                time: rec.time || 'Time not specified',
                budget: rec.budget || '$',
                why_perfect: rec.why_perfect || 'Good match for your preferences'
            }));
            
            return parsedData;
            
        } catch (error) {
            console.error('Error parsing API response:', error);
            throw new Error('PARSE_ERROR');
        }
    }

    /**
     * Main method to generate recommendations
     */
    async generateRecommendations(preferences) {
        try {
            const results = await this.callAPI(preferences);
            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('Recommendation generation failed:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
}

// Initialize API instance
window.hungraiAPI = new HungrAIAPI();

// Expose main function for UI to use
window.generateResults = async function() {
    const preferences = window.hungraiState?.getCurrentPreferences?.() || {};
    console.log('Generating results for:', preferences);
    
    // Update UI to show loading
    const resultsContent = document.getElementById('results-content');
    if (resultsContent) {
        resultsContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p class="loading-text">${window.hungraiContent?.content?.modals?.results?.loading?.text || 'Analyzing your preferences...'}</p>
            </div>
        `;
    }
    
    // Show results modal
    window.hungraiUI?.closeModal('preferences-modal');
    window.hungraiUI?.openModal('results-modal');
    
    try {
        const result = await window.hungraiAPI.generateRecommendations(preferences);
        
        if (result.success) {
            window.hungraiUI?.displayResults(result.data);
        } else {
            window.hungraiUI?.showError(result.error);
        }
    } catch (error) {
        console.error('Error in generateResults:', error);
        window.hungraiUI?.showError('UNEXPECTED_ERROR');
    }
};