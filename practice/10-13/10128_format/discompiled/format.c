/* __x86.get_pc_thunk.bx */
void __x86_get_pc_thunk_bx();

void func_0(int32_t a1, int32_t a2);

void __gmon_start__();

/* .init_proc */
void init_proc() {
    int32_t ebx1;

    __x86_get_pc_thunk_bx();
    if (*(int32_t*)(ebx1 + 0x1b4f + -4) != func_0) {
        __gmon_start__();
    }
    return;
}

int32_t g804a00c = 0x804a094;

/* .printf */
void printf(void* a1, void* a2) {
    goto g804a00c;
}

int32_t g804a010 = 0x804a098;

/* .free */
void free(void* a1, void* a2) {
    goto g804a010;
}

int32_t g804a014 = 0x804a09c;

/* .time */
int32_t time(int32_t a1) {
    goto g804a014;
}

int32_t g804a018 = 0x804a0a0;

/* .rewind */
void rewind(int32_t a1, int16_t a2) {
    goto g804a018;
}

int32_t g804a01c = 0x804a0a4;

/* .fseek */
void fseek(int32_t a1, int16_t a2) {
    goto g804a01c;
}

int32_t g804a020 = 0x804a0a8;

/* .fread */
void fread(void* a1, signed char a2) {
    goto g804a020;
}

int32_t g804a024 = 0x804a0ac;

/* .strcpy */
void strcpy(void* a1, void* a2, signed char a3) {
    goto g804a024;
}

int32_t g804a028 = 0x804a0b0;

/* .puts */
void puts(void* a1, void* a2) {
    goto g804a028;
}

int32_t g804a02c = 0x804a0b4;

/* .srand */
void srand(int32_t a1) {
    goto g804a02c;
}

int32_t g804a030 = 0x804a0b8;

/* .__libc_start_main */
void __libc_start_main(int32_t a1, int32_t a2, void* a3, int32_t a4, int32_t a5, int32_t a6, void** a7, int32_t a8) {
    goto g804a030;
}

int32_t g804a034 = 0x804a0bc;

/* .ftell */
void* ftell(int32_t a1, int16_t a2) {
    goto g804a034;
}

int32_t g804a038 = 0x804a0c0;

/* .setvbuf */
void setvbuf(int32_t a1, int24_t a2) {
    goto g804a038;
}

int32_t g804a03c = 0x804a0c4;

/* .fopen */
int32_t fopen(int32_t a1, int32_t a2) {
    goto g804a03c;
}

int32_t g804a040 = 0x804a0c8;

/* .rand */
int32_t rand() {
    goto g804a040;
}

int32_t g804a044 = 0x804a0cc;

/* .__isoc99_scanf */
void __isoc99_scanf(int32_t a1, void* a2) {
    goto g804a044;
}

int32_t g8049ffc = 0x804a0d4;

void __gmon_start__() {
    goto g8049ffc;
}

/* __x86.get_pc_thunk.bx */
void __x86_get_pc_thunk_bx() {
    return;
}

void deregister_tm_clones() {
    int32_t v1;

    if (!1 && !1) {
        func_0(0x804a050, v1);
    }
    return;
}

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

int32_t main();

void __libc_csu_init(int32_t a1, int32_t a2);

void _start() {
    void* esp1;
    int32_t v2;
    int32_t edx3;
    int32_t eax4;

    esp1 = (void*)((int32_t)"intrinsic"() + 4);
    __libc_start_main(main, v2, esp1, __libc_csu_init, 0x8048900, edx3, ((uint32_t)esp1 & 0xfffffff0) - 4 - 4, eax4);
    __asm__("hlt ");
}

/* .term_proc */
void term_proc() {
    __x86_get_pc_thunk_bx();
    return;
}

int32_t g8049f10 = 0;

void frame_dummy() {
    int32_t v1;

    if (!((int1_t)(g8049f10 == func_0) || 1)) {
        func_0("", v1);
    }
    if (!1 && !1) {
        func_0(0x804a050, func_0);
    }
    return;
}

void func_80486bd() {
}

void func_80488fd() {
    return;
}

void func_804864c() {
}

signed char g804a054 = -1;

void func_8048685() {
    if ((int1_t)(g804a054 == func_0)) {
        deregister_tm_clones();
        g804a054 = 1;
    }
    return;
}

int32_t g804a050 = -1;

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

void __libc_csu_init(int32_t a1, int32_t a2) {
    int32_t v3;
    int32_t ebp4;
    int32_t ebx5;
    int32_t ebx6;
    int32_t ebp7;
    int32_t esi8;
    int32_t edi9;
    int32_t esi10;
    int32_t v11;
    int32_t v12;

    v3 = ebp4;
    __x86_get_pc_thunk_bx();
    ebx5 = ebx6 + 0x1757;
    ebp7 = a1;
    init_proc();
    esi8 = ebx5 + 0xffffff0c - (ebx5 + 0xffffff08) >> 2;
    if (esi8 != func_0) {
        edi9 = (int32_t)func_0;
        esi10 = esi8;
        do {
            *(int32_t*)(ebx5 + edi9 * 4 + 0xffffff08)(ebp7, v11, v12, v3);
            ++edi9;
        } while (edi9 != esi10);
    }
    return;
}
