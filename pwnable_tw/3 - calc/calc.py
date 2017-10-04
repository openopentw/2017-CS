# Have you ever use Microsoft calculator?
# nc chall.pwnable.tw 10100

from pwn import *
context(arch='i386', os='linux')

host = '192.168.122.215'
port = 8888
# host = 'chall.pwnable.tw'
# port = 10100

r = remote(host, port)
