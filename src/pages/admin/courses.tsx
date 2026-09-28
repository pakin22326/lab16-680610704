import { useState } from "react";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, X, Plus, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AdminCoursesPage() {
  const { courses, addCourse, deleteCourse, removeInstructor } =
    useEnrollmentStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  
  const [openCombobox, setOpenCombobox] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState("");

  const allExistingInstructors = Array.from(
    new Set(courses.flatMap((c) => c.instructors || []))
  );

  const trimmedCode = courseCode.trim();
  const isDuplicate = courses.some(
    (c) => c.courseCode.toLowerCase() === trimmedCode.toLowerCase()
  );

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate || !trimmedCode) return;

    addCourse({
      courseCode: trimmedCode.toUpperCase(),
      courseTitle: courseTitle.trim(),
      instructors: selectedInstructors,
    });

    setIsOpen(false);
    setCourseCode("");
    setCourseTitle("");
    setSelectedInstructors([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button><Plus className="w-4 h-4 mr-2" /> เพิ่มวิชา</Button>} />
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาเรียนใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  aria-invalid={isDuplicate}
                  className={isDuplicate ? "border-red-500 focus-visible:ring-red-500" : ""}
                  placeholder="เช่น CPE303"
                  required
                />
                {isDuplicate && (
                  <p className="text-sm text-red-500 mt-1">
                    มีรหัสวิชา {trimmedCode.toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="เช่น Mobile Application Development"
                  required
                />
              </div>

              <div>
                <Label className="block mb-1">ผู้สอน</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger render={
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-auto min-h-10 py-2"
                    >
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {selectedInstructors.length > 0 ? (
                          selectedInstructors.map((ins) => (
                            <Badge
                              key={ins}
                              variant="secondary"
                              className="gap-1.5 py-0.5 px-2.5 bg-blue-50 text-blue-600 rounded-full border-none hover:bg-blue-100"
                            >
                              <span>{ins}</span>
                              <button
                                type="button"
                                className="rounded-full outline-none p-0.5 hover:bg-blue-200 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInstructors(
                                    selectedInstructors.filter((i) => i !== ins)
                                  );
                                }}
                              >
                                <X className="w-3 h-3 text-blue-600" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-normal">
                            เลือกหรือพิมพ์ชื่อผู้สอน...
                          </span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  } />
                  <PopoverContent className="w-[380px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="ค้นหาหรือพิมพ์ผู้สอนใหม่..."
                        value={instructorSearch}
                        onValueChange={setInstructorSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {instructorSearch.trim() ? (
                            <div
                              className="p-2 text-sm cursor-pointer hover:bg-accent text-primary font-medium"
                              onClick={() => {
                                const newIns = instructorSearch.trim();
                                if (!selectedInstructors.includes(newIns)) {
                                  setSelectedInstructors([
                                    ...selectedInstructors,
                                    newIns,
                                  ]);
                                }
                                setInstructorSearch("");
                                setOpenCombobox(false);
                              }}
                            >
                              + เพิ่มผู้สอน &quot;{instructorSearch.trim()}&quot;
                            </div>
                          ) : (
                            <p className="p-2 text-sm text-muted-foreground text-center">
                              ไม่พบข้อมูลผู้สอน
                            </p>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {instructorSearch.trim() &&
                            !allExistingInstructors.some(
                              (ins) =>
                                ins.toLowerCase() ===
                                instructorSearch.trim().toLowerCase()
                            ) && (
                              <CommandItem
                                value={instructorSearch}
                                onSelect={() => {
                                  const newIns = instructorSearch.trim();
                                  if (!selectedInstructors.includes(newIns)) {
                                    setSelectedInstructors([
                                      ...selectedInstructors,
                                      newIns,
                                    ]);
                                  }
                                  setInstructorSearch("");
                                  setOpenCombobox(false);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                เพิ่มผู้สอน &quot;{instructorSearch.trim()}&quot;
                              </CommandItem>
                            )}

                          {allExistingInstructors.map((ins) => {
                            const isSelected = selectedInstructors.includes(ins);
                            return (
                              <CommandItem
                                key={ins}
                                value={ins}
                                onSelect={() => {
                                  if (isSelected) {
                                    setSelectedInstructors(
                                      selectedInstructors.filter((i) => i !== ins)
                                    );
                                  } else {
                                    setSelectedInstructors([
                                      ...selectedInstructors,
                                      ins,
                                    ]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {ins}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isDuplicate || !trimmedCode}>
                  บันทึก
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>
                    {course.instructors && course.instructors.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {course.instructors.map((ins) => (
                          <Badge
                            key={ins}
                            variant="secondary"
                            className="gap-1.5 py-0.5 px-2.5 bg-blue-50 text-blue-600 rounded-full border-none hover:bg-blue-100"
                          >
                            <span>{ins}</span>
                            <button
                              type="button"
                              className="rounded-full outline-none p-0.5 hover:bg-blue-200 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeInstructor(course.courseCode, ins);
                              }}
                            >
                              <X className="w-3 h-3 text-blue-600" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger render={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      } />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบวิชา?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ลบ {course.courseCode} ({course.courseTitle}) ออกจากรายวิชาที่เปิดสอน
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCourse(course.courseCode)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  ยังไม่มีวิชาที่เปิดสอน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}