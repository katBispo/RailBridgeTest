import socket

HOST = '127.0.0.1'
PORT = 7169

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((HOST, PORT))

print(f"Servidor UDP rodando em {HOST}:{PORT}")
while True:
    data, addr = sock.recvfrom(1024)
    print(f"Recebido de {addr}: {data.hex()}")
    response = bytes([0xFA, 0x02, 0x00, 0x00, 0xF6])  # ACK_SLAVE
    sock.sendto(response, addr)
    print(f"Enviado para {addr}: {response.hex()}")