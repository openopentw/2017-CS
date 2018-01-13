1. srand(0) 會產生固定的亂數，所以只要選其中 8 個亂數給他就可以了
2. 剩下還有  8*4+4=32+4=36 左右個 bytes 可以放東西
3. stack 的位置可以 leak 出來，也有 x 的權限
4. 目前想到的作法：把 shellcode 寫到 stack 上，蓋掉 return address 去執行他
   1. 遇到的固難： shellcode 很常不會出現數字，就會被以「no duplicate nubmers」否決了…