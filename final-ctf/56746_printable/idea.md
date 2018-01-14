1. 用 `&argv` -> `argv` -> `argv[0]` 的 chain 來寫特定位置 (`1/16` 的機率猜到 chain 的 address)
   1. 把 `exit@GOT` 寫成回到 `main` 的一開始
   2. 把 `printf@GOT` 寫成 `system`
   3. 或把 `read` 寫成 `syscall` ?

