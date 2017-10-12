# hw2 write-up - Computer Security

學號：b04902053

姓名：鄭淵仁

## write-up

`gothijack` 這支程式一共會讀三次資料，第一次會讀 48 個 char 到固定位置的 global buffer；第二次會讀 24 個 char ，並轉成 16 進位的數字；第三次會讀 8 個 char 到第二次讀的 16 進位的數字代表的位址。

但是在 `check()` 裡面，他是用 `for` 迴圈一一檢查表格裡面 index 小於 `strlen` 的元素是不是字母或數字。

所以我就在第一次給 input 的時候直接給他 `'\0'` ，接下來再給開 `/bin/sh` 的 shellcode。這樣一來程式讀到 `'\0'`  就會停下來，而不會再往下檢查 shellcode 了。

第二次 input 的時候我就給 `puts()` 的 GOT 的位置，第三次 input 我就給我寫入的 shellcode 的位置。這樣就可以在最後一次 `puts("done!")` 的時候改執行 `execve(/bin/sh)` 了。