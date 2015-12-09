require 'sinatra'
require 'json'

# NOTE: the filename where the data
# is located (a constant)
DB_FILENAME = 'data.json'

helpers do
  # NOTE: if the file data.json does not exist,
  # return an empty string
  def read_file
    begin
      File.read(DB_FILENAME)
    rescue Errno::ENOENT
      ''
    end
  end

  # NOTE: if the data is not valid JSON,
  # return an empty array
  def read_data
    begin
      JSON.parse(read_file)
    rescue JSON::ParserError
      []
    end
  end

  def write_data(data)
    File.write(DB_FILENAME, JSON.pretty_generate(data))
  end
end

error 422 do
  'Unprocessable Entity'
end

get '/' do
  # NOTE: using haml as our template format
  haml :index, format: :html5
end

get '/favorites' do
  read_file
end

# NOTE: when we are trying to persist new data in
# the backend, we should use POST request
post '/favorites' do
  request.body.rewind
  # NOTE: Since this is a POST request,
  # the data is in the request body,
  # not in the params
  request_payload = JSON.parse(request.body.read)
  return 422 unless request_payload['name'] && request_payload['oid']

  favorites = read_data
  movie = {
    name: request_payload['name'],
    oid:  request_payload['oid']
  }

  favorites << movie
  write_data(favorites)

  movie.to_json
end
