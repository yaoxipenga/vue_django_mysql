const app = new Vue({
    el: '#app',
    data() {
        const rulesSNo = (rule, value, callback) => {
            if (this.isEdit) {
                callback();
            }
            axios.post(
                this.baseURL + 'sno/check/',
                {
                    sno: value,
                }
            )
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.exists) {
                            callback(new Error("学号已存在!!"));
                        } else {
                            callback();
                        }
                    }
                    else {
                        callback(new Error("校验学号后端出现异常!"))
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        return {
            students: [],
            pageStudents: [],
            baseURL: "https://域名地址/api/",
            inputStr: '',
            selectStudents: [],
            total: 100,
            currentpage: 1,
            pagesize: 10,
            dialogVisible: false,
            dialogTitle: "",
            isView: false,
            isEdit: false,
            studentForm: {
                sno: '',
                name: '',
                gender: '',
                birthday: '',
                mobile: '',
                email: '',
                address: '',
                image: '',
                imageUrl: '',
            },
            rules: {
                sno: [
                    { required: true, message: '学号不能为空', trigger: 'blur' },
                    { pattern: /^95\d{3}$/, message: '学号必须是95开头的五位数', trigger: 'blur' },
                    { validator: rulesSNo, trigger: 'blur' },
                ],
                name: [
                    { required: true, message: '姓名不能为空', trigger: 'blur' },
                    { pattern: /^[\u4e00-\u9fa5]{2,5}$/, message: '姓名必须是2-5个汉字', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '性别不能为空', trigger: 'change' },
                ],
                birthday: [
                    { required: true, message: '出生日期不能为空', trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '手机号码不能为空', trigger: 'blur' },
                    { pattern: /^[1][35789]\d{9}$/, message: '手机号码必须符合规范', trigger: 'blur' },
                ],
                email: [
                    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
                    { pattern: /^\w+([-.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: '邮箱地址必须符合规范', trigger: 'blur' },
                ],
                address: [
                    { required: true, message: '家庭住址不能为空', trigger: 'blur' },
                ],

            }
        }
    },
    mounted() {
        this.getStudents();
    },
    methods: {
        getStudents: function () {
            let that = this
            axios
                .get(that.baseURL + "students/")
                .then(function (res) {
                    if (res.data.code == 1) {
                        that.students = res.data.data;
                        that.total = res.data.data.length;
                        that.getPageStudents();
                        that.$message({
                            message: '数据加载成功',
                            type: 'success'
                        });
                    }
                    else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                })
        },
        getAllStudents: function () {
            this.inputStr = ""
            this.getStudents();
        },
        getPageStudents() {
            this.pageStudents = [];
            for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
                this.pageStudents.push(this.students[i]);
                if (this.pageStudents.length == this.pagesize) break;
            }
        },
        queryStudents() {
            let that = this
            axios
                .post(
                    that.baseURL + 'students/query/',
                    {
                        inputstr: that.inputStr
                    }
                )
                .then(function (res) {
                    if (res.data.code === 1) {
                        that.students = res.data.data;
                        that.total = res.data.data.length;
                        that.getPageStudents();
                        that.$message({
                            message: '数据查询成功',
                            type: 'success'
                        });
                    } else {
                        that.$message.error(res.data.msg);
                    }
                }

                )
                .catch(function (err) {
                    console.log(err)
                    that.$message.error("获取后端查询结果出现异常!!")
                }

                )
        },
        addStudents() {
            this.dialogTitle = "添加学生明细"
            this.dialogVisible = true;

        },
        getImageBySno(sno) {
            for (oneStudent of this.students) {
                if (oneStudent.sno == sno) {
                    return oneStudent.image;
                }
            }
        },
        viewStudent(row) {
            this.dialogTitle = "查看学生明细"
            this.isView = true;
            this.dialogVisible = true;
            // this.studentForm.sno = row.sno;
            // this.studentForm.name = row.name;
            // this.studentForm.gender = row.gender;
            // this.studentForm.birthday = row.birthday;
            // this.studentForm.mobile = row.mobile;
            // this.studentForm.email = row.email;
            // this.studentForm.address = row.address;
            // this.studentForm.image = row.image;
            this.studentForm = JSON.parse(JSON.stringify(row));
            this.studentForm.image = this.getImageBySno(row.sno);
            this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;

        },
        updateStudent(row) {
            this.dialogTitle = "修改学生明细"
            this.isEdit = true;
            this.dialogVisible = true;
            this.studentForm = JSON.parse(JSON.stringify(row));
            this.studentForm.image = this.getImageBySno(row.sno);
            this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;

        },
        submitStudentForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.isEdit) {
                        this.submitUpdateStudent();
                    } else {
                        this.submitAddStudent();
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        submitAddStudent() {
            let that = this;
            axios
                .post(that.baseURL + 'student/add/', that.studentForm)
                .then(res => {
                    if (res.data.code === 1) {
                        that.students = res.data.data;
                        that.total = res.data.data.length;
                        that.getPageStudents();
                        that.$message({
                            message: '学生信息增加成功',
                            type: 'success'
                        });
                        that.closeDialogForm('studentForm')
                    } else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    console.log(err)
                    that.$message.error("获取后端结果出现异常!!")
                })
        },
        submitUpdateStudent() {
            let that = this;
            axios
                .post(that.baseURL + 'student/update/', that.studentForm)
                .then(res => {
                    if (res.data.code === 1) {
                        that.students = res.data.data;
                        that.total = res.data.data.length;
                        that.getPageStudents();
                        that.$message({
                            message: '学生信息修改成功',
                            type: 'success'
                        });
                        that.closeDialogForm('studentForm')
                    } else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    console.log(err)
                    that.$message.error("修改时获取后端结果出现异常!!")
                })

        },
        deleteStudent(row) {
            this.$confirm('是否确认删除学生信息【学号:' + row.sno + ' \t姓名: ' + row.name + '】信息？', '提示', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let that = this
                axios
                    .post(that.baseURL + 'student/delete/', { sno: row.sno })
                    .then(res => {
                        if (res.data.code === 1) {
                            that.students = res.data.data
                            that.total = res.data.data.length;
                            that.getPageStudents();
                            that.$message({
                                message: '数据删除成功',
                                type: 'success'
                            });
                        }
                        else {
                            that.$message.error(res.data.msg);
                        }
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        deleteStudents() {
            this.$confirm('是否确认批量删除' + this.selectStudents.length + '个学生信息？', '提示', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let that = this
                axios
                    .post(that.baseURL + 'students/delete/', { student: that.selectStudents })
                    .then(res => {
                        if (res.data.code === 1) {
                            that.students = res.data.data
                            that.total = res.data.data.length;
                            that.getPageStudents();
                            that.$message({
                                message: '数据批量删除成功',
                                type: 'success'
                            });
                        }
                        else {
                            that.$message.error(res.data.msg);
                        }
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        closeDialogForm(formName) {
            this.$refs[formName].resetFields();
            this.studentForm.sno = "";
            this.studentForm.name = "";
            this.studentForm.gender = "";
            this.studentForm.birthday = "";
            this.studentForm.mobile = "";
            this.studentForm.email = "";
            this.studentForm.address = "";
            this.studentForm.image = "";
            this.dialogVisible = false;
            this.isView = false;
            this.isEdit = false;
            this.studentForm.image = "";
            this.studentForm.imageUrl = "";
        },
        uploadPicturePost(file) {
            // 定义 that
            let that = this;
            //定义一个formdata的类
            let fileReq = new FormData();
            //把照片传进去
            fileReq.append('avatar', file.file);
            //使用Axios发起Ajax请求
            axios({
                method: 'post',
                url: that.baseURL + 'upload/',
                data: fileReq
            })
                .then(res => {
                    // 根据code判断是否成功
                    if (res.data.code === 1) {
                        //把照片给image
                        that.studentForm.image = res.data.name;
                        //拼接imageUrl
                        that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
                    } else {
                        //失败的提示！
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    console.log(err);
                    that.$message.error("上传头像出现异常!");
                });
        },

        uploadExcelPost(file) {
            let that = this;
            let fileReq = new FormData();
            fileReq.append('excel', file.file);
            axios({
                method: 'post',
                url: that.baseURL + 'excel/import/',
                data: fileReq
            })
                .then(res => {
                    if (res.data.code === 1) {
                        that.students = res.data.data;
                        that.total = res.data.data.length;
                        that.getPageStudents();
                        this.$alert('本次导入完成，成功:' + res.data.success + '\t' + '失败: ' + res.data.error, '导入结果展示', {
                            confirmButtonText: '确定',
                            callback: action => {
                                this.$message({
                                    type: 'info',
                                    message: "本次导入失败的数量为: " + res.data.error + '\t' + "具体的学号: " + res.data.errors
                                });
                            }
                        });
                        console.log("本次导入失败的数量为: " + res.data.error + "具体的学号: ")
                        console.log(res.data.errors)
                        that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
                    } else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    console.log(err);
                    that.$message.error("上传excel出现异常!");
                });
        },
        exportToExcel() {
            let that = this
            axios
                .get(that.baseURL + 'excel/export/')
                .then(res => {
                    if (res.data.code === 1) {
                        let url = that.baseURL + 'media/' + res.data.name;
                        window.open(url)
                    } else {
                        that.$message.error("导出excel出现异常!")
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        },
        handleSizeChange(size) {
            this.pagesize = size;
            this.getPageStudents();
        },
        handleCurrentChange(pageNumber) {
            this.currentpage = pageNumber;
            this.getPageStudents();
        },
        handleSelectionChange(data) {
            this.selectStudents = data;
            console.log(data);
        }
    },
})