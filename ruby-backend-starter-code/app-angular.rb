require 'sinatra'
require 'json'

set :haml, format: :html5
set :port, 3000
set :bind, '0.0.0.0'

get '/' do
  haml :'index-angular'
end

get '/favorites' do
  # Sinatra has its own may to indicate that the content is json
  content_type :json

  # Don't forget to rescue in case we are not able to read the file
  begin
    File.read('data.json')
  rescue
    []
  end
end

# It should be a POST, since we insert a new entry
post '/favorites' do
  content_type :json

  # Actually, since we post the new favorite to add, we should store
  # them in the body of the request, not as a parameter. With Sinatra
  # we need to parse the body of the request
  params = JSON.parse(request.body.read)

  # We retrieve the saved data. In case the favorites file is not valid
  # we need to rescue it
  data =
    begin
      JSON.parse(File.read('data.json'))
    rescue
      []
    end

  data << { name: params['name'], oid: params['oid'] }
  File.write('data.json', JSON.pretty_generate(data))

  data.to_json
end
