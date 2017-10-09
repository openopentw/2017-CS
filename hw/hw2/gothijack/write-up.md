# hw2 write-up - Computer Security

學號：b04902053

姓名：鄭淵仁

## write-up

## 筆記

程式流程：

1. 第一次輸入 48 個 `char` 到 `6295712` ，而且只能輸入 alphabet 或 number

   - 這裡看起來是可以輸入 shellcode 的地方，但是只能輸入 alphabet 或 number

   - 所以變成只能輸入 library 的位置

     > 去找 library 的位置！(GOT hijack)

2. 第二次輸入 24 個 `char` 到某個位置，這次輸入的結果會被轉成16進位的數字，當作下一次輸入的位置。

   - 這裡可以給他 `return` 的位置，好在下一次 return-to-library

3. 第三次輸入 8 個 `char` 到上一次輸入給的位置

   - 這裡可以給他我第一次輸入的位置（`6295712`），這樣就可以 return-to-library 了。

4. 確認輸入格式無誤之後會 `puts("done!")`