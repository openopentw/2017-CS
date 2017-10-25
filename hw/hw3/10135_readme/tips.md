# Tips from Teacher

- 可以先跳原本 `main` 中間 有一段 `lea rax, [rbp-0x20]` 下次 `read` 會讀到 `rbp` 指向的位置
- 改 `read` got，變成原本的位置 + `0xe` ，就可以當作 `syscall` 用了
- `<__libc_csu_init>`
  - `400690`: pop registers and call system call
  - `4006ac`: pop registers
  - `read` 的數量會被放到 `rax`
    - （ `4006b6`: get `rax` ）


