int32_t main() {
    void* esp1;
    void* ebp2;
    void* v3;
    int32_t eax4;
    int32_t eax5;
    void* v6;
    void* v7;

    esp1 = (void*)"intrinsic"();
    ebp2 = (void*)(((uint32_t)esp1 & 0xfffffff0) - 4 - 4);
    v3 = (void*)((uint32_t)esp1 + 4);
    setvbuf(g804a050, 0x200);
    eax4 = time(0x20000);
    srand(eax4);
    eax5 = rand();
    readflag((uint32_t)ebp2 + 0xffffff00);
    printf("username = ", v6);
    v7 = (void*)((uint32_t)ebp2 + -56);
    __isoc99_scanf("%40s", v7);
    printf("Hi ", v7);
    printf((uint32_t)ebp2 + -56, v7);
    printf("\npassword = ", v7);
    __isoc99_scanf("%d", (uint32_t)ebp2 + -16);
    if (!(int1_t)(eax5 == func_0)) {
        puts("Bye~", v3);
    } else {
        puts("Congrets", v3);
        puts((uint32_t)ebp2 + 0xffffff00, v3);
    }
    free((uint32_t)ebp2 + 0xffffff00, v3);
    return func_0;
}
