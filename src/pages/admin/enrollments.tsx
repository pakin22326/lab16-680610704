import { useState } from "react";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusCircle, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminEnrollmentsPage() {
  const { courses, students, enrollStudents, removeStudentFromCourse } =
    useEnrollmentStore();

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);

  // State สำหรับระบบค้นหาหน้าหลัก
  const [searchType, setSearchType] = useState<"course" | "student">("course");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>("all");

  const availableStudents = students.filter(
    (s) => !s.enrolledCourses.includes(selectedCourseCode),
  );

  const handleCourseChange = (value: string | null) => {
    const courseCode = value ?? "";
    setSelectedCourseCode(courseCode);
    setSelectedStudentIds([]);
  };

  const handleEnroll = () => {
    if (!selectedCourseCode || selectedStudentIds.length === 0) return;
    enrollStudents(selectedCourseCode, selectedStudentIds);
    setEnrollDialogOpen(false);
    setSelectedCourseCode("");
    setSelectedStudentIds([]);
  };

  const filteredCourses = courses.filter((course) => {
    if (searchType === "course") {
      if (
        selectedFilterValue !== "all" &&
        course.courseCode !== selectedFilterValue
      ) {
        return false;
      }
      return true;
    } else {
      if (selectedFilterValue === "all") return true;
      const enrolledStudents = students.filter((s) =>
        s.enrolledCourses.includes(course.courseCode),
      );
      return enrolledStudents.some((s) => s.studentId === selectedFilterValue);
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          จัดการการลงทะเบียน
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Admin สามารถลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Dialog
          open={enrollDialogOpen}
          onOpenChange={(open) => {
            setEnrollDialogOpen(open);
            if (!open) {
              setSelectedCourseCode("");
              setSelectedStudentIds([]);
            }
          }}
        >
          <DialogTrigger>
            <span className="inline-flex items-center justify-center bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
              <PlusCircle className="h-4 w-4 mr-2" />
              ลงทะเบียนให้นักศึกษา
            </span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
            <DialogHeader>
              <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                เลือกวิชาก่อน แล้วจึงเลือกรายชื่อนักศึกษาที่ต้องการลงทะเบียน
                (เลือกได้มากกว่า 1 คน)
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  เลือกวิชา
                </Label>
                <Select
                  value={selectedCourseCode}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectValue placeholder="-- เลือกวิชาเรียน --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    {courses.map((c) => (
                      <SelectItem key={c.courseCode} value={c.courseCode}>
                        {c.courseCode} — {c.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">
                  เลือกนักศึกษา
                </Label>
                <Popover
                  open={studentPopoverOpen}
                  onOpenChange={setStudentPopoverOpen}
                >
                  <PopoverTrigger>
                    <span
                      role="combobox"
                      aria-expanded={studentPopoverOpen}
                      className={cn(
                        "w-full flex items-center justify-between font-normal bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-md text-sm",
                        !selectedCourseCode && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {!selectedCourseCode
                        ? "กรุณาเลือกวิชาก่อน"
                        : selectedStudentIds.length > 0
                          ? `เลือกแล้ว ${selectedStudentIds.length} คน`
                          : "-- เลือกรายชื่อนักศึกษา --"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <Command className="bg-transparent text-zinc-900 dark:text-zinc-100">
                      <CommandInput placeholder="ค้นหาชื่อหรือรหัสนักศึกษา..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบรายชื่อนักศึกษา</CommandEmpty>
                        <CommandGroup>
                          {availableStudents.map((s) => {
                            const isSelected = selectedStudentIds.includes(
                              s.studentId,
                            );
                            return (
                              <CommandItem
                                key={s.studentId}
                                value={`${s.firstName} ${s.lastName} ${s.studentId}`}
                                onSelect={() => {
                                  if (isSelected) {
                                    setSelectedStudentIds(
                                      selectedStudentIds.filter(
                                        (id) => id !== s.studentId,
                                      ),
                                    );
                                  } else {
                                    setSelectedStudentIds([
                                      ...selectedStudentIds,
                                      s.studentId,
                                    ]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {s.firstName} {s.lastName} ({s.studentId})
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedStudentIds.map((id) => {
                    const student = students.find((s) => s.studentId === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1.5 py-1 px-2.5 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                      >
                        <span>
                          {student?.firstName} {student?.lastName} ({id})
                        </span>
                        <button
                          type="button"
                          className="rounded-full outline-none focus:ring-1 focus:ring-sky-400 p-0.5 hover:bg-sky-200 dark:hover:bg-sky-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentIds(
                              selectedStudentIds.filter((sId) => sId !== id),
                            );
                          }}
                        >
                          <X className="w-3 h-3 text-sky-600 dark:text-sky-400 hover:text-destructive" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={
                  !selectedCourseCode || selectedStudentIds.length === 0
                }
                onClick={handleEnroll}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                ลงทะเบียน ({selectedStudentIds.length} คน)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 bg-transparent p-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchType("course");
              setSelectedFilterValue("all");
            }}
            className={cn(
              "rounded-md text-sm font-normal px-3 h-8",
              searchType === "course"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700 font-medium"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60",
            )}
          >
            ค้นหาตามวิชา
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchType("student");
              setSelectedFilterValue("all");
            }}
            className={cn(
              "rounded-md text-sm font-normal px-3 h-8",
              searchType === "student"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700 font-medium"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60",
            )}
          >
            ค้นหาตามนักศึกษา
          </Button>
        </div>

        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger>
            <span
              role="combobox"
              aria-expanded={filterPopoverOpen}
              className="w-[140px] flex items-center justify-between font-normal bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm px-3 py-2 rounded-md text-sm"
            >
              {selectedFilterValue === "all"
                ? searchType === "course"
                  ? "ทุกวิชา"
                  : "ทุกคน"
                : searchType === "course"
                  ? (() => {
                      const c = courses.find(
                        (item) => item.courseCode === selectedFilterValue,
                      );
                      return c ? c.courseCode : "ทุกวิชา";
                    })()
                  : (() => {
                      const s = students.find(
                        (item) => item.studentId === selectedFilterValue,
                      );
                      return s ? `${s.firstName} ${s.lastName}` : "ทุกคน";
                    })()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 align-start bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
            <Command className="bg-transparent text-zinc-900 dark:text-zinc-100">
              <CommandInput
                placeholder={
                  searchType === "course"
                    ? "ค้นหารหัสหรือชื่อวิชา..."
                    : "ค้นหาชื่อหรือรหัสนักศึกษา..."
                }
              />
              <CommandList>
                <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedFilterValue("all");
                      setFilterPopoverOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedFilterValue === "all"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {searchType === "course" ? "ทุกวิชา" : "ทุกคน"}
                  </CommandItem>

                  {searchType === "course"
                    ? courses.map((c) => {
                        const isSelected = selectedFilterValue === c.courseCode;
                        return (
                          <CommandItem
                            key={c.courseCode}
                            value={`${c.courseCode} ${c.courseTitle}`}
                            onSelect={() => {
                              setSelectedFilterValue(c.courseCode);
                              setFilterPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {c.courseCode} — {c.courseTitle}
                          </CommandItem>
                        );
                      })
                    : students.map((s) => {
                        const isSelected = selectedFilterValue === s.studentId;
                        return (
                          <CommandItem
                            key={s.studentId}
                            value={`${s.studentId} ${s.firstName} ${s.lastName}`}
                            onSelect={() => {
                              setSelectedFilterValue(s.studentId);
                              setFilterPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {s.studentId} — {s.firstName} {s.lastName}
                          </CommandItem>
                        );
                      })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
            <TableRow className="border-zinc-200 dark:border-zinc-800">
              <TableHead className="w-[120px] text-zinc-700 dark:text-zinc-300">
                รหัสวิชา
              </TableHead>
              <TableHead className="text-zinc-700 dark:text-zinc-300">
                ชื่อวิชา
              </TableHead>
              <TableHead className="w-[120px] text-zinc-700 dark:text-zinc-300">
                จำนวน นศ.
              </TableHead>
              <TableHead className="text-zinc-700 dark:text-zinc-300">
                รายชื่อนักศึกษาที่ลงทะเบียน
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-zinc-500 dark:text-zinc-400"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => {
                const enrolledStudents = students.filter((s) =>
                  s.enrolledCourses.includes(course.courseCode),
                );

                return (
                  <TableRow
                    key={course.courseCode}
                    className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {course.courseCode}
                    </TableCell>
                    <TableCell className="text-zinc-900 dark:text-zinc-100">
                      {course.courseTitle}
                    </TableCell>
                    <TableCell className="text-zinc-900 dark:text-zinc-100">
                      {enrolledStudents.length} คน
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {enrolledStudents.length > 0 ? (
                          enrolledStudents.map((s) => (
                            <Badge
                              key={s.studentId}
                              variant="secondary"
                              className="gap-1.5 py-1 px-2.5 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                            >
                              <span>
                                {s.firstName} {s.lastName} ({s.studentId})
                              </span>
                              <button
                                type="button"
                                className="rounded-full outline-none focus:ring-1 focus:ring-sky-400 p-0.5 hover:bg-sky-200 dark:hover:bg-sky-900 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStudentFromCourse(
                                    course.courseCode,
                                    s.studentId,
                                  );
                                }}
                              >
                                <X className="w-3 h-3 text-sky-600 dark:text-sky-400 hover:text-destructive" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-sm">
                            ยังไม่มีนักศึกษาลงทะเบียน
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
