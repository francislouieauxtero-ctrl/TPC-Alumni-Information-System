<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentHeadController extends AdminController
{
    public function dashboard(Request $request): JsonResponse
    {
        return parent::dashboard($request);
    }

    public function stats(Request $request): JsonResponse
    {
        return parent::stats($request);
    }

    public function listStudents(Request $request): JsonResponse
    {
        return parent::listStudents($request);
    }

    public function deactivateStudent(Request $request, $id): JsonResponse
    {
        return parent::deactivateStudent($request, $id);
    }

    public function activateStudent(Request $request, $id): JsonResponse
    {
        return parent::activateStudent($request, $id);
    }

    public function deleteStudent(Request $request, $id): JsonResponse
    {
        return parent::deleteStudent($request, $id);
    }
}