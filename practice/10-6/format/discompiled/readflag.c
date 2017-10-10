void readflag(void* a1) {
    void* ebp2;
    int32_t eax3;
    int32_t v4;
    void* eax5;
    void* v6;
    void* v7;

    ebp2 = (void*)((int32_t)"intrinsic"() - 4);
    eax3 = fopen("./flag", "r");
    v4 = eax3;
    fseek(v4, 0x200);
    eax5 = ftell(v4, 0x200);
    v6 = eax5;
    rewind(v4, 0x200);
    v7 = v6;
    fread((int32_t)ebp2 + 0xffffff28, 1);
    *(signed char*)((uint32_t)a1 + (int32_t)v6) = (signed char)func_0;
    strcpy(a1, (int32_t)ebp2 + 0xffffff28, *((signed char*)&v7 + 3));
    return;
}
