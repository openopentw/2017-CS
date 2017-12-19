# calc

## flag

```
flag{31337_is_so_l33t}
```

## payload

```
3133731337.31337
```

## write-up

在 `GetWindowTextA` 和 `GetWindowTextW` 下斷點，讓他繼續執行到 return 之後，就可以看到他在比對 string，照著把那些 string (`payload`) 寫入，就可以得到 flag。
