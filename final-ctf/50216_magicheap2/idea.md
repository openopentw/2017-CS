做法：

1. 用 fastbin malloc 到 free ，把 free 改成 puts

2. 用 free (現在是 puts 了)  把已經在墓地的 chunk puts 出來，就可以 leak 到 libc 的資訊

   (所以要事先塞一個 chunk 去墓地)

3. 用 libc 的資訊把 free 換成 system

4. system("/bin/sh")