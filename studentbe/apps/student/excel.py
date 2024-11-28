import openpyxl


def read_excel_dict(path: str):
    workbook = openpyxl.load_workbook(path)
    sheet = workbook['student']
    students = []
    keys = ['sno', 'name', 'gender', 'birthday', 'mobile', 'email', 'address']
    for row in sheet.rows:
        temp_dict = {}
        for index, cell in enumerate(row):
            temp_dict[keys[index]] = cell.value
        students.append(temp_dict)
    return students


if __name__ == '__main__':
    path = r"C:\python3\student01.xlsx"
    students = read_excel_dict(path)
    print(students)