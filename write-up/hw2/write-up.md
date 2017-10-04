# [hw1] write-up

`disassemble` 程式之後，觀察到程式會從 `main()` 輸入字串，再呼叫 `encrypt()` 來寫出結果到 `flag`。

所以用 `gdb` 觀察變數，發現：一直到進入 `encrypt()` 之前，輸入的字串都沒被改動。而 `encrypt()` 會把輸入的字串經過一連串操作後，再 `fwrite()` 到檔案 `flag` 上。所以關鍵在於程式如何「加密」輸入的字串。

接著先觀察輸入和輸出的關係，發現輸入的字串中的每一個字元，會被獨立轉成 4 個 bytes，不會和其他字元有關係，但是和字元的位置有關係。這個發現對於我接下來翻譯 assembler code 的思考有所幫助。

接下來就要從 assembler code 整理出原始的 c code。在這個過程中，我是寫一個 python script 模擬自己以為的加密的流程，再搭配 `gdb` 來修改自己以為的加密的流程，最後成功整理出原始的程式碼。

所以最後就反著做程式的流程就可以把檔案 `flag` 轉換回輸入的 flag string 了。

> 模擬 `hw1` 的 python 檔： `translate.py`
>
> 把 `flag` 檔案的內容轉回輸入的 flag string 的 python 檔：`inv_translate.py`