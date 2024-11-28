# Generated by Django 3.2 on 2024-11-05 03:03

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('sno', models.IntegerField(db_column='sNo', primary_key=True, serialize=False)),
                ('name', models.CharField(db_column='sName', max_length=100)),
                ('gender', models.CharField(choices=[('男', '男'), ('女', '女')], db_column='Gender', max_length=100)),
                ('birthday', models.DateField(db_column='Birthday')),
                ('mobile', models.CharField(db_column='Mobile', max_length=100)),
                ('email', models.CharField(db_column='Email', max_length=100)),
                ('address', models.CharField(db_column='Address', max_length=200)),
                ('image', models.CharField(db_column='Image', max_length=200, null=True)),
            ],
            options={
                'db_table': 'Student',
                'managed': True,
            },
        ),
    ]
