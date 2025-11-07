# _plugins/environment.rb
# Automatically loads .env file and makes environment variables available to Jekyll

module Jekyll
  class EnvironmentVariablesGenerator < Generator
    priority :highest
    
    def generate(site)
      puts "🔍 Looking for .env file..."
      
      # Look for .env file in site source directory
      env_file = File.join(site.source, '.env')
      
      if File.exist?(env_file)
        puts "✅ Loading environment variables from .env"
        load_env_file(env_file, site)
      else
        puts "⚠️  No .env file found. Create one with your OPENAI_API_KEY"
      end
      
      # Set API key in site config for Jekyll templates
      api_key = ENV['OPENAI_API_KEY'] || site.config['openai_api_key']
      
      if api_key && api_key != 'not-configured'
        site.config['openai_api_key'] = api_key
        puts "🔐 API key loaded (#{api_key[0..7]}...)"
      else
        puts "❌ No API key found. Add OPENAI_API_KEY to .env file"
        site.config['openai_api_key'] = 'not-configured'
      end
    end
    
    private
    
    def load_env_file(env_file, site)
      File.readlines(env_file).each_with_index do |line, index|
        line = line.strip
        
        # Skip empty lines and comments
        next if line.empty? || line.start_with?('#')
        
        # Parse key=value pairs
        if line.include?('=')
          key, value = line.split('=', 2)
          key = key.strip
          value = value.strip
          
          # Remove surrounding quotes if present
          value = value.gsub(/\A['"]|['"]\z/, '') if value
          
          # Set environment variable
          ENV[key] = value if key && value
          
          # Also make available in site config (optional)
          site.config[key.downcase] = value if key && value
        else
          puts "⚠️  Invalid line #{index + 1} in .env: #{line}"
        end
      end
    end
  end
end