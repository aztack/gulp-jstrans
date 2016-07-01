app.controller("CommentsController", function($log, $rootScope, $scope, $routeParams, $window, $modal, AlertService, AuthService, CourseService, OnlineClassService) {
    $("#commentTable").tablesort();
    //  CourseService.filter().success(function(courses, status, headers, config) {
    CourseService.filterIncludeMajor().success(function(courses, status, headers, config) {
        if (courses) {
            $scope.courses = courses;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    $scope.selectedCourses = [];
    $scope.selectedPerson = [];
    $(".ui.checkbox").checkbox();
    function initCondition() {
        $scope.condition = {
            start: 0,
            length: 10
        };
    }
    initCondition();
    $scope.doFilter = function(condition) {
        $scope.filtering = true;
        condition.courseIds = $scope.selectedCourses;
        $scope.loadData(condition);
    };
    $scope.doReset = function() {
        $scope.reseting = true;
        initCondition();
        $scope.loadData($scope.condition);
    };
    $scope.loadData = function(condition) {
        OnlineClassService.filterForComments(condition).success(function(onlineClasses, status, headers, config) {
            $scope.filtering = false;
            $scope.reseting = false;
            if (onlineClasses) {
                $scope.onlineClasses = onlineClasses;
            }
        }).error(function(data, status, headers, config) {
            $scope.filtering = false;
            $scope.reseting = false;
            AlertService.serviceError();
        });
        OnlineClassService.countForComments(condition).success(function(count, status, headers, config) {
            if (count) {
                $scope.count = count;
            }
        }).error(function(data, status, headers, config) {
            AlertService.serviceError();
        });
    };
    if (AuthService.hasLogin()) {
        $scope.loadData($scope.condition);
    }
    $scope.doLoadDataForPage = function() {
        if ($scope.page) {
            $scope.condition.start = $scope.condition.length * ($scope.page - 1);
            OnlineClassService.filterForComments($scope.condition).success(function(onlineClasses, status, headers, config) {
                if (onlineClasses) {
                    $scope.onlineClasses = onlineClasses;
                }
            }).error(function(data, status, headers, config) {
                AlertService.serviceError();
            });
        }
    };
    $scope.doSelectCourses = function(selectedCourse) {
        var index = $scope.selectedCourses.indexOf(selectedCourse.id);
        if (index > -1) {
            $scope.selectedCourses.splice(index, 1);
        } else {
            $scope.selectedCourses.push(selectedCourse.id);
        }
    };
    $scope.isTeacherCommentEmpty = function(onlineClass, student) {
        if (onlineClass.teacherComments) {
            for (var i = 0; i < onlineClass.teacherComments.length; i++) {
                var teacherComment = onlineClass.teacherComments[i];
                if (teacherComment.student.id == student.id) {
                    return teacherComment.empty;
                }
            }
        }
        return true;
    };
    $scope.isFiremanToStudentCommentEmpty = function(onlineClass, student) {
        if (onlineClass.firemanToStudentComments) {
            for (var i = 0; i < onlineClass.firemanToStudentComments.length; i++) {
                var firemanToStudentComment = onlineClass.firemanToStudentComments[i];
                if (firemanToStudentComment.student.id == student.id) {
                    return firemanToStudentComment.empty;
                }
            }
        }
        return true;
    };
    $scope.isFiremanToTeacherCommentEmpty = function(onlineClass, student) {
        if (onlineClass.firemanToTeacherComment) {
            return onlineClass.firemanToTeacherComment.empty;
        }
        return true;
    };
});

app.controller("CommentController", function($log, $rootScope, $scope, $routeParams, $window, $modal, $routeParams, AlertService, TeacherCommentService, FiremanToStudentCommentService, FiremanToTeacherCommentService, OnlineClassService, StudentService) {
    OnlineClassService.find($routeParams.onlineClassId).success(function(onlineClass, status, headers, config) {
        if (onlineClass) {
            $scope.onlineClass = onlineClass;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    StudentService.find($routeParams.studentId).success(function(student, status, headers, config) {
        if (student) {
            $scope.student = student;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    $scope.tempNums = [ 1, 2, 3, 4, 5 ];
    TeacherCommentService.findByOnlineClassIdAndStudentId($routeParams.onlineClassId, $routeParams.studentId).success(function(teacherComment, status, headers, config) {
        if (teacherComment) {
            $scope.teacherComment = teacherComment;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    FiremanToStudentCommentService.findByOnlineClassIdAndStudentId($routeParams.onlineClassId, $routeParams.studentId).success(function(firemanToStudentComment, status, headers, config) {
        if (firemanToStudentComment) {
            $scope.firemanToStudentComment = firemanToStudentComment;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    FiremanToTeacherCommentService.findByOnlineClassId($routeParams.onlineClassId).success(function(firemanToTeacherComment, status, headers, config) {
        if (firemanToTeacherComment) {
            $scope.firemanToTeacherComment = firemanToTeacherComment;
        }
    }).error(function(data, status, headers, config) {
        AlertService.serviceError();
    });
    $scope.doOpenTeacherCommentEditor = function() {
        if ($scope.teacherComment) {
            $scope.editorMode = "update";
        } else {
            $scope.editorMode = "create";
        }
        $scope.teacherCommentEditorModal = $modal({
            scope: $scope,
            template: "partials/education/comment/teacherCommentEditor.html?v=5b2b26",
            backdrop: "static"
        });
    };
    $scope.doOpenFiremanToStudentCommentEditor = function() {
        if ($scope.firemanToStudentComment) {
            $scope.editorMode = "update";
        } else {
            $scope.editorMode = "create";
        }
        $scope.firemanToStudentCommentEditorModal = $modal({
            scope: $scope,
            template: "partials/education/comment/firemanToStudentCommentEditor.html?v=5b2b26",
            backdrop: "static"
        });
    };
    $scope.doOpenFiremanToTeacherCommentEditor = function() {
        if ($scope.firemanToTeacherComment) {
            $scope.editorMode = "update";
        } else {
            $scope.editorMode = "create";
        }
        $scope.firemanToTeacherCommentEditorModal = $modal({
            scope: $scope,
            template: "partials/education/comment/firemanToTeacherCommentEditor.html?v=fa6d38",
            backdrop: "static"
        });
    };
});

app.controller("TeacherCommentEditorController", function($log, $rootScope, $scope, $routeParams, $window, $modal, $routeParams, AlertService, TeacherCommentService, OnlineClassService, StudentService) {
    if ($scope.editorMode == "create") {
        OnlineClassService.find($routeParams.onlineClassId).success(function(onlineClass, status, headers, config) {
            if (onlineClass) {
                $scope.onlineClass = onlineClass;
            }
        }).error(function(data, status, headers, config) {
            $scope.error = "Can not create the teacher comment, please try again later.";
        });
        StudentService.find($routeParams.studentId).success(function(student, status, headers, config) {
            if (student) {
                $scope.student = student;
            }
        }).error(function(data, status, headers, config) {
            $scope.error = "Can not create the teacher comment, please try again later.";
        });
    } else {}
    $scope.doCancel = function() {
        $scope.teacherCommentEditorModal.hide();
    };
    // TODO  因为在book的时候会创建所有的comment,所以该页面不需要create,只需要update,需将create相关逻辑干掉
    $scope.doCreateTeacherComment = function() {
        $scope.creating = true;
        if ($scope.teacherComment) {
            $scope.teacherComment.onlineClass = $scope.onlineClass;
            $scope.teacherComment.student = $scope.student;
            $scope.teacherComment.teacher = $scope.onlineClass.teacher;
            // 2015-08-31 返回的对象为Response
            TeacherCommentService.create($scope.teacherComment).success(function(response, status, headers, config) {
                if (response) {
                    //                  $scope.teacherComment = teacherComment;
                    $scope.creating = false;
                }
                $scope.teacherCommentEditorModal.hide();
            }).error(function(data, status, headers, config) {
                $scope.creating = false;
                $scope.error = "Can not create the teacher comment, please try again later.";
            });
        }
    };
    $scope.doUpadateTeacherComment = function() {
        $scope.updating = true;
        if ($scope.teacherComment) {
            // 2015-08-31 返回的对象为Response
            TeacherCommentService.update($scope.teacherComment).success(function(response, status, headers, config) {
                if (response) {
                    //                  $scope.teacherComment = teacherComment;
                    $scope.updating = false;
                }
                $scope.teacherCommentEditorModal.hide();
            }).error(function(data, status, headers, config) {
                $scope.updating = false;
                $scope.error = "Can not create the teacher comment, please try again later.";
            });
        }
    };
});

app.controller("FiremanToStudentCommentEditorController", function($log, $rootScope, $scope, $routeParams, $window, $modal, $routeParams, AlertService, FiremanToStudentCommentService) {
    $scope.studentBehaviorProblems = [ {
        name: "LEAVE_FROM_SITE",
        checked: false
    }, {
        name: "LEAVE_FROM_CAMERA",
        checked: false
    }, {
        name: "NO_INTRESTING",
        checked: false
    }, {
        name: "PLAY_OTHER_THINGS",
        checked: false
    }, {
        name: "PLAY_MOUSE_OR_KEYBOARD",
        checked: false
    }, {
        name: "CRY",
        checked: false
    }, {
        name: "DISTRACTED",
        checked: false
    }, {
        name: "NEED_PARENT_HELP",
        checked: false
    } ];
    $scope.studentITProblems = [ {
        name: "MICROPHONE",
        checked: false
    }, {
        name: "EARPHONE",
        checked: false
    }, {
        name: "NETWORK",
        checked: false
    }, {
        name: "SYSTEM",
        checked: false
    }, {
        name: "ECHO",
        checked: false
    }, {
        name: "NOISE",
        checked: false
    }, {
        name: "EARPHONE",
        checked: false
    }, {
        name: "SPEAKER",
        checked: false
    } ];
    // if have the comment, to check the checkbox
    if ($scope.firemanToStudentComment) {
        for (var i = 0; i < $scope.studentBehaviorProblems.length; i++) {
            var studentBehaviorProblem = $scope.studentBehaviorProblems[i];
            if ($scope.firemanToStudentComment.studentBehaviorProblem.indexOf(studentBehaviorProblem.name) >= 0) {
                studentBehaviorProblem.checked = true;
            }
        }
        for (var j = 0; j < $scope.studentITProblems.length; j++) {
            var studentITProblem = $scope.studentITProblems[j];
            if ($scope.firemanToStudentComment.studentITProblem.indexOf(studentITProblem.name) >= 0) {
                studentITProblem.checked = true;
            }
        }
    }
    $scope.doCancel = function() {
        $scope.firemanToStudentCommentEditorModal.hide();
    };
    $scope.doUpdateFiremanToStudent = function() {
        if ($scope.firemanToStudentComment && !$scope.updating) {
            $scope.updating = true;
            // push the behavior problem list to the firemanToStudentComment
            $scope.firemanToStudentComment.studentBehaviorProblem = [];
            angular.forEach($scope.studentBehaviorProblems, function(studentBehaviorProblem) {
                if (studentBehaviorProblem.checked) {
                    $scope.firemanToStudentComment.studentBehaviorProblem.push(studentBehaviorProblem.name);
                }
            });
            // push the it problem list to the firemanToStudentComment
            $scope.firemanToStudentComment.studentITProblem = [];
            angular.forEach($scope.studentITProblems, function(studentITProblem) {
                if (studentITProblem.checked) {
                    $scope.firemanToStudentComment.studentITProblem.push(studentITProblem.name);
                }
            });
            FiremanToStudentCommentService.update($scope.firemanToStudentComment).success(function(firemanToStudentComment, status, headers, config) {
                if (firemanToStudentComment) {
                    $scope.firemanToStudentComment = firemanToStudentComment;
                    $scope.updating = false;
                }
                $scope.firemanToStudentCommentEditorModal.hide();
            }).error(function(data, status, headers, config) {
                $scope.updating = false;
                $scope.error = "Can not update fireman to teacher comment, please try again later.";
            });
        }
    };
});

app.controller("FiremanToTeacherCommentEditorController", function($log, $rootScope, $scope, $routeParams, $window, $modal, $routeParams, AlertService, TeacherCommentService, OnlineClassService, FiremanToTeacherCommentService, FiremanToStudentCommentService) {
    $scope.teacherBehaviorProblems = [ {
        name: "UNREAY",
        checked: false
    }, {
        name: "BAD_ATTITUDE",
        checked: false
    }, {
        name: "CANNOT_FINISH_CLASS",
        checked: false
    }, {
        name: "LEAVE_EARLY",
        checked: false
    } ];
    $scope.teacherITProblems = [ {
        name: "MICROPHONE",
        checked: false
    }, {
        name: "EARPHONE",
        checked: false
    }, {
        name: "NETWORK",
        checked: false
    }, {
        name: "SYSTEM",
        checked: false
    }, {
        name: "ECHO",
        checked: false
    }, {
        name: "NOISE",
        checked: false
    }, {
        name: "SPEAKER",
        checked: false
    } ];
    if ($scope.firemanToTeacherComment) {
        for (var i = 0; i < $scope.teacherBehaviorProblems.length; i++) {
            var teacherBehaviorProblem = $scope.teacherBehaviorProblems[i];
            if ($scope.firemanToTeacherComment.teacherBehaviorProblem.indexOf(teacherBehaviorProblem.name) >= 0) {
                teacherBehaviorProblem.checked = true;
            }
        }
        for (var j = 0; j < $scope.teacherITProblems.length; j++) {
            var teacherITProblem = $scope.teacherITProblems[j];
            if ($scope.firemanToTeacherComment.teacherITProblem.indexOf(teacherITProblem.name) >= 0) {
                teacherITProblem.checked = true;
            }
        }
    }
    $scope.doCancel = function() {
        $scope.firemanToTeacherCommentEditorModal.hide().reload();
    };
    $scope.doUpdateFiremanToTeacher = function() {
        if ($scope.firemanToTeacherComment && !$scope.updating) {
            $scope.updating = true;
            $scope.firemanToTeacherComment.teacherBehaviorProblem = [];
            angular.forEach($scope.teacherBehaviorProblems, function(teacherBehaviorProblem) {
                if (teacherBehaviorProblem.checked) {
                    $scope.firemanToTeacherComment.teacherBehaviorProblem.push(teacherBehaviorProblem.name);
                }
            });
            $scope.firemanToTeacherComment.teacherITProblem = [];
            angular.forEach($scope.teacherITProblems, function(teacherITProblem) {
                if (teacherITProblem.checked) {
                    $scope.firemanToTeacherComment.teacherITProblem.push(teacherITProblem.name);
                }
            });
            FiremanToTeacherCommentService.update($scope.firemanToTeacherComment).success(function(firemanToTeacherComment, status, headers, config) {
                if (firemanToTeacherComment) {
                    $scope.firemanToTeacherComment = firemanToTeacherComment;
                    $scope.updating = false;
                }
                $scope.firemanToTeacherCommentEditorModal.hide();
            }).error(function(data, status, headers, config) {
                $scope.updating = false;
                $scope.error = "Can not update fireman to teacher comment, please try again later.";
            });
        }
    };
});