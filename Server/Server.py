# The code below was taken from a github repository by Peter McLennan at https://github.com/gondwanasoft/fitbit-stream-bridge/tree/main (last accessed 2024-08-13) 
# BEGIN Copied Code 
import asyncio
import websockets

SERVER_LOCAL_HOST = "localhost"		
SERVER_LOCAL_PORT = 8080					# server's port for Fitbit connection
SERVER_LAN_HOST = "0.0.0.0"	# server's IP address for LAN connection (when running on phone for Fitbit watch connection)
SERVER_LAN_PORT = 8081						

server_tasks = set()
websocket_fitbit = None
websocket_client = None						
async def fitbit_handler(websocket):
	print("fitbit_handler starting")
	global websocket_fitbit
	websocket_fitbit = websocket
	async for message in websocket_fitbit:
		if websocket_client != None and websocket_client.open:
			await websocket_client.send(message)

async def client_handler(websocket):
	print("client_handler starting")
	global websocket_client
	websocket_client = websocket
	async for message in websocket_client:
		if websocket_fitbit != None and websocket_fitbit.open:
			await websocket_fitbit.send(message)

async def start_fitbit_server():
	print("before starting fitbit_handler")
	async with websockets.serve(fitbit_handler, SERVER_LOCAL_HOST, SERVER_LOCAL_PORT):
		print("after starting fitbit_handler")
		await asyncio.Future()

async def start_client_server():
		print("before starting client_handler")
		async with websockets.serve(client_handler, SERVER_LAN_HOST, SERVER_LAN_PORT):
			print("after starting client_handler")
			await asyncio.Future()

async def start_servers():
	fitbit_task = asyncio.create_task(start_fitbit_server())
	server_tasks.add(fitbit_task)

	client_task = asyncio.create_task(start_client_server())
	server_tasks.add(client_task)

	await asyncio.Future()

asyncio.run(start_servers())

#END Copied Code
