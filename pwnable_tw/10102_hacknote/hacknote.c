#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

typedef struct note {
	void (*print_content)(struct note *);
	char *content;
} Note;

int max_note_index; // 0x804a04c
Note *notes[5]; // 0x804a050 // sizeof() == 4

void print_content(Note *note) // 0x804862b
{
	puts(note->content);
}

void add_note()
{
	if (max_note_index > 5) {
		puts("Full");
		return;
	} else {
		for(int i = 0; i <= 4; ++i) {
			if(notes[i]) {
				continue;
			}

			notes[i] = (Note*)malloc(8);
			if(!notes[i]) {
				puts("Alloca Error");
				exit(-1);
			}

			notes[i]->print_content = print_content;

			printf("Note size: ");
			char note_size_buf[4];
			read(0, note_size_buf, 8); // XXX: overflow to note_size !?
			int note_size = atoi(note_size_buf);

			notes[i]->content = (char*)malloc(note_size);
			if(!notes[i]->content) {
				puts("Alloca Error");
				exit(-1);
			}

			printf("Content: ");
			read(0, notes[i]->content, note_size);

			puts("Success !");
			++max_note_index;
		}
	}
	return;
}

void delete_note() {
	printf("Index :");
	char index_buf[4];
	read(0, index_buf, 4);
	int index = atoi(index_buf);

	if (index < 0 || index > max_note_index) {
		puts("Out of bound!");
		_exit(0);
	} else {
		if (!notes[index]) {
			free(notes[index]->content);
			free(notes[index]);
			puts("Success");
		}
	}
}

void print_note() {
	printf("Index :");
	char index_buf[4];
	read(0, index_buf, 4);
	int index = atoi(index_buf);

	if (index < 0 || index > max_note_index) {
		puts("Out of bound!");
		_exit(0);
	} else {
		if (notes[index]) {
			notes[index]->print_content(notes[index]);
		}
	}
}

void show_menu() {
	puts("----------------------");
	puts("       HackNote       ");
	puts("----------------------");
	puts(" 1. Add note          ");
	puts(" 2. Delete note       ");
	puts(" 3. Print note        ");
	puts(" 4. Exit              ");
	puts("----------------------");
	printf("Your choice :");
}

int main()
{
	setvbuf(stdout, 0, 2, 0);
	setvbuf(stdin, 0, 2, 0);
	while(1) {
		show_menu();

		char choice_buf[4];
		read(0, choice_buf, 4);
		int choice = atoi(choice_buf);

		switch(choice) {
			case 1:
				add_note();
				break;
			case 2:
				delete_note();
				break;
			case 3:
				print_note();
				break;
			case 4:
				exit(0);
			default:
				puts("Invalid choice");
		}
	}
}
