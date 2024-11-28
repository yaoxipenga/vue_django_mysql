from django.shortcuts import render

# Create your views here.
from apps.student.models import Student
from django.http import JsonResponse
import json
from django.db.models import Q
import uuid
import hashlib
from django.conf import settings
import os, openpyxl


def get_students(request):
    try:
        obj_students = Student.objects.all().values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '获取学生信息出现异常，具体错误: ' + str(e)})


def query_students(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_students = Student.objects.filter(
            Q(sno__icontains=data['inputstr']) | Q(
                name__icontains=data['inputstr']) | Q(gender__icontains=data['inputstr']) | Q(
                birthday__icontains=data['inputstr']) | Q(mobile__icontains=data['inputstr']) | Q(
                email__icontains=data['inputstr']) | Q(address__icontains=data['inputstr'])).values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '查询学生信息出现异常，具体错误: ' + str(e)})


def is_exist_sno(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_students = Student.objects.filter(sno=data['sno'])
        if obj_students.count() == 0:
            return JsonResponse({'code': 1, 'exists': False})
        else:
            return JsonResponse({'code': 1, 'exists': True})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '校验学号失败，具体原因: ' + str(e)})


def add_student(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_student = Student(sno=data['sno'], name=data['name'], gender=data['gender'], birthday=data['birthday'],
                              mobile=data['mobile'], email=data['email'], address=data['address'], image=data['image'])
        obj_student.save()
        obj_students = Student.objects.all().values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '添加到数据库出现异常，具体原因: ' + str(e)})


def update_student(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_student = Student.objects.get(sno=data['sno'])
        obj_student.name = data['name']
        obj_student.gender = data['gender']
        obj_student.birthday = data['birthday']
        obj_student.mobile = data['mobile']
        obj_student.email = data['email']
        obj_student.address = data['address']
        obj_student.image = data['image']
        obj_student.save()
        obj_students = Student.objects.all().values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '修改保存到数据库出现异常，具体原因: ' + str(e)})


def delete_student(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        obj_student = Student.objects.get(sno=data['sno'])
        obj_student.delete()
        obj_students = Student.objects.all().values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '删除写入数据库出现异常，具体原因: ' + str(e)})


def delete_students(request):
    data = json.loads(request.body.decode('utf-8'))
    try:
        for one_student in data['student']:
            obj_student = Student.objects.get(sno=one_student['sno'])
            obj_student.delete()
        obj_students = Student.objects.all().values()
        students = list(obj_students)
        return JsonResponse({'code': 1, 'data': students})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': '删除写入数据库出现异常，具体原因: ' + str(e)})


def upload(request):
    rev_file = request.FILES.get('avatar')
    if not rev_file:
        return JsonResponse({'code': 0, 'msg': '图片不存在!'})
    new_name = get_random_str()
    file_extension = os.path.splitext(rev_file.name)[1]
    file_path = os.path.join(settings.MEDIA_ROOT, new_name + file_extension)
    try:
        f = open(file_path, 'wb')
        for i in rev_file.chunks():
            f.write(i)
        f.close()
        return JsonResponse({'code': 1, 'name': new_name + file_extension})
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': str(e)})


def get_random_str():
    uuid_val = uuid.uuid4()
    uuid_str = str(uuid_val).encode('utf-8')
    md5 = hashlib.md5()
    md5.update(uuid_str)
    return md5.hexdigest()


def import_students_excel(request):
    rev_file = request.FILES.get('excel')
    if not rev_file:
        return JsonResponse({'code': 0, 'msg': 'Excel文件不存在！'})
    new_name = get_random_str()
    file_path = os.path.join(settings.MEDIA_ROOT, new_name + os.path.splitext(rev_file.name)[1])
    try:
        f = open(file_path, 'wb')
        for i in rev_file.chunks():
            f.write(i)
        f.close()
    except Exception as e:
        return JsonResponse({'code': 0, 'msg': str(e)})

    ex_students = read_excel_dict(file_path)
    success = 0
    error = 0
    error_snos = []

    for one_student in ex_students:
        try:

            obj_student = Student.objects.create(sno=one_student['sno'], name=one_student['name'],
                                                 gender=one_student['gender'],
                                                 birthday=one_student['birthday'], mobile=one_student['mobile'],
                                                 email=one_student['email'], address=one_student['address'])
            success += 1
        except:
            error += 1
            error_snos.append(one_student['sno'])

    obj_students = Student.objects.all().values()
    students = list(obj_students)
    return JsonResponse({'code': 1, 'success': success, 'error': error, 'errors': error_snos, 'data': students})


def export_students_excel(request):
    obj_students = Student.objects.all().values()
    students = list(obj_students)
    excel_name = get_random_str() + '.xlsx'
    path = os.path.join(settings.MEDIA_ROOT, excel_name)
    write_to_excel(students, path)
    return JsonResponse({'code': 1, 'name': excel_name})


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


def write_to_excel(data: list, path: str):
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = 'student'
    keys = data[0].keys()
    for index, item in enumerate(data):
        for k, v in enumerate(keys):
            sheet.cell(row=index + 1, column=k + 1, value=str(item[v]))
    workbook.save(path)
