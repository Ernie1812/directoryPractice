//******** FUNCTIONS ************/
var table;
function populateTable() {
    $.ajax({
    url: 'libs/php/getAll.php',
    method: 'POST',
    dataType: 'json',
    success: function (result) {
        let tableData = result.data;
            table = $('#table').DataTable ({
            "responsive": true,
            "destroy": true,
            "data" : tableData,
            "order": [[ 2, "asc" ]],
            "columnDefs": [
                {
                    "targets": [ 0 ],
                    "visible": false,
                    "searchable": false
                }],
            "columns" : [
                { "data" : "employeeID" },
                { "data" : "firstName" },
                { "data" : "lastName" },
                { "data" : "jobTitle" },
                { "data" : "email" },
                { "data" : "department" },
                { "data" : "location" },
                
                {defaultContent : '<button type="button" id="btn-edit" class="btn btn-primary"><i class="bi bi-pencil-square"></i></button><button type="button" id="btn_delete" class="btn btn-danger"><i class="bi bi-person-x-fill"></i></button>',
                className: "td-buttons"
                }
            ],
            responsive: {
                details: {
                    renderer: function ( api, rowIdx, columns ) {
                        var data = $.map( columns, function ( col, i ) {
                            return col.hidden ?
                                '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
                                    '<td>'+col.title+':'+'</td> '+
                                    '<td' + (col.title === 'Edit' ? ' class="td-buttons"' : '') + '>'+col.data+'</td>'+
                                '</tr>' :
                                '';
                        } ).join('');
         
                        return data ?
                            $('<table/>').append( data ) :
                            false;
                    }
                }
             } 
        });
    }
});
}

//function to populate department select options
function popDeptSelOptions() {
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    method: 'POST',
    dataType: 'json',
    success: function (result) {
        console.log('Departments', result);
        if (result.status.name == "ok") {
            $('.employeeDepartment, #deleteDepartment').empty();

            for (var i=0; i<result.data.length; i++) {
                $('.employeeDepartment, #deleteDepartment').append($('<option>', {
                    value: result.data[i].id,
                    text: result.data[i].name,
                }, '</option>'));
                
            }
        }
    }
  });  
};

let deptID;
$('.employeeDepartment').on('change',function() {
    deptID = $(this).find('option:selected').val();
    console.log(deptID);
    linkDeptLoc();
});

function linkDeptLoc() {
    $.ajax({
        url: 'libs/php/getLocationByDepartmentID.php',
        method: 'POST',
        dataType: 'json',
        data: {
            deptID: deptID
        },
        success: function (result) {
            $('.employeeLocation').attr('value', result.data[0].name);
        }
    });
  };

//function to populate location select options
function popLocationSelOptions() {
    $.ajax({
      url: 'libs/php/getAllLocations.php',
      method: 'POST',
      dataType: 'json',
      success: function (result) {
          console.log('Locations', result);
          if (result.status.name == "ok") {
            $('#selAddDeptLocation, #deleteLocation').empty();
              for (var i=0; i<result.data.length; i++) {
                  $('#selAddDeptLocation, #deleteLocation').append($('<option>', {
                      value: result.data[i].id,
                      text: result.data[i].name,
                  }, '</option>'));
                  
              }
          }
      }
    });  
  };

//function for general alert modal
function alertModal(newRecord, newDepartment,updatedRecord, deletedRecord) {
    $("#alertModal").modal('show');

    if(newRecord){
        return newRecord;
        
    } else if (newDepartment) {
        return newDepartment;
        
    } else if (updatedRecord) {
        return updatedRecord;
        
    } else if (deletedRecord) {
        return deletedRecord;

    } else if (newLocation) {
        return newLocation;
        
    } else if (deletedLocation) {
        return deletedLocation;
        
    } else if (deletedDepartment) {
        return deletedDepartment;

    } else {
        $("#alertTxt").html('Error: Action not completed');
    }
    
};

//function to check for empty fields
function isNotEmpty(field) {
    if (field.val() == '') {
        field.css('border', '1px solid red');
        return false;
    } else {
        field.css('border', '');
        return true;
    }
}

//call function to populate table
populateTable();


//call function to populate department select options
popDeptSelOptions();

//******** EMPLOYEE RECORDS************/

//show add new employee modal
$("#addNew").on('click', function () {
    $("#personFirstName").val("");
    $("#personLastName").val("");
    $("#personJobTitle").val("");
    $("#personEmail").val("");
    
    deptID = $('.employeeDepartment option:selected').val();
    linkDeptLoc();
    popDeptSelOptions();
    $("#tableManager").modal('show');
});

//add a new employee 
$("#manageData").on("click", function() {
    
    var fName = $("#personFirstName");
    var lName = $("#personLastName");
    var pJobTitle = $("#personJobTitle");
    var pEmail = $("#personEmail");
    var pDept = $(".employeeDepartment");
    var pLoc = $(".employeeLocation");

    if (isNotEmpty(fName) && isNotEmpty(lName) && isNotEmpty(pEmail) && isNotEmpty(pDept) && isNotEmpty(pLoc)) {
        $.ajax({
            url: 'libs/php/insertPersonnel.php',
            method: 'POST',
            dataType: 'json',
            data: {
                fName: fName.val(),
                lName: fName.val(),
                pJobTitle: pJobTitle.val(),
                pEmail: pEmail.val(),
                pDept: pDept.val()
            }, success: function (result) {
                populateTable();
                const newRecord = $("#alertTxt").html('New Employee Record Created');
                $("#tableManager").modal('hide');
                alertModal(newRecord);
                
            }
        });
    }
});

//show edit employee modal with employee data
$(document).on('click', '#btn-edit', function () {
    popDeptSelOptions();
    $("#editEmployee").modal('show');
    var editRow = $(this).closest('tr');
    var editEmployID = table.row( editRow ).data().employeeID;
    
    $.ajax({
        url: 'libs/php/getPersonnel.php',
        method: 'POST',
        dataType: 'json',
        data: {
            id: editEmployID
        },
        success: function (result) {
            console.log('edit employee',result);
            $("#editEmployID").attr('value', result.data.personnel[0].id);
            $("#editFirstName").attr('value', result.data.personnel[0].firstName);
            $("#editLastName").attr('value', result.data.personnel[0].lastName);
            $("#editJobTitle").attr('value', result.data.personnel[0].jobTitle);
            $("#editEmail").attr('value', result.data.personnel[0].email);
            $('.employeeDepartment option[value="' + result.data.personnel[0].departmentID +'"]').prop("selected", true);

            deptID = $('.employeeDepartment option:selected').val();
            linkDeptLoc();
        }
    });
});

//save updated employee record
$("#saveEdit").on("click", function() {
    $.ajax({
        url: 'libs/php/updatePersonnelByID.php',
        method: 'POST',
        dataType: 'json',
        data: {
            fName: $("#editFirstName").val(),
            lName: $("#editLastName").val(),
            pJobTitle: $("#editJobTitle").val(),
            pEmail: $("#editEmail").val(),
            pDept: deptID,
            employeeID: $("#editEmployID").val()
        },
        success: function (result) {
            updatedRecord = $("#alertTxt").html('Updated Employee Record');
            $("#editEmployee").modal('hide');
            alertModal(updatedRecord)
            populateTable();
        }
    });
});

//delete employee record
$(document).on("click", "#btn_delete", function() {
    $("#deleteModal").modal('show');
    var deleteRow = $(this).closest('tr');
    var id = table.row( deleteRow ).data().employeeID;
    $("#btn-delete").on("click", function() {
    
        $.ajax({
            url: 'libs/php/deletePersonnelByID.php',
            method: 'POST',
            dataType: 'json',
            data: {
                id: id
            },
            success: function (result) {
                $("#deleteModal").modal('hide');
                const deletedRecord = $("#alertTxt").html('Employee Record Deleted');
                alertModal(deletedRecord);
                populateTable();

            }
        });
        
    })
});

//******** LOCATION RECORDS************/
//show edit locations modal
$("#editLocationBtn").on('click', function () {
    $("#editLocationModal").modal('show');
});

//show add new Location modal
$("#btn-addLocationModal").on('click', function () {
    $("#addLocationName").val("");
    $("#editLocationModal").modal('hide');
    $("#addNewLocationModal").modal('show');
});

// add a new location
$("#btn-locationAdd").on("click", function() {
    var addLocationName = $("#addLocationName");

    if (isNotEmpty(addLocationName)) {
        $.ajax({
            url: 'libs/php/insertLocation.php',
            method: 'POST',
            dataType: 'json',
            data: {
                addLocationName: addLocationName.val(),
            }, success: function (result) {
                $("#addNewLocationModal").modal('hide');
                popLocationSelOptions();
                const newLocation = $("#alertTxt").html('New Location Record Created');
                alertModal(newLocation);
                
            }
        });
    }
});

//show delete location modal
$("#btn-deleteLocationModal").on('click', function () {
    $("#editLocationModal").modal('hide');
    $("#deleteLocationModal").modal('show');
    popLocationSelOptions();
});

//delete location record
$("#btn-deleteLocation").on("click", function() {
    $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            const filterData = result.data.filter((a) => (a.location === $( "#deleteLocation option:selected" ).text()));
            if (filterData.length !== 0) {
                $("#deleteLocationModal").modal('hide');
                let deletedLocation = $("#alertTxt").html('Error: Cannot delete Location with current employees.');
                alertModal(deletedLocation);
              } else {
                $("#deleteLocationModal").modal('hide');
                $("#deleteModal").modal('show');
                $("#btn-delete").on("click", function() {
                    $("#deleteModal").modal('hide');
                    $.ajax({
                        url: 'libs/php/deleteLocationByID.php',
                        method: 'POST',
                        dataType: 'json',
                        data: {
                            deleteLocationID: $( "#deleteLocation option:selected" ).val()
                        },
                    success: function (result) {
                        let deletedLocation = $("#alertTxt").html('Location Record Deleted.');
                        alertModal(deletedLocation);
                        populateTable();
                    }
                    });
                });
              }
        }
    });
})

//******** DEPARTMENT RECORDS************/

//show edit department modal
$("#editDepartment").on('click', function () {
    popDeptSelOptions();
    $("#editDeptModal").modal('show');
    
});

//show add new department modal
$("#btn-addDeptModal").on('click', function () {
    $("#addDeptName").val("");
    $("#editDeptModal").modal('hide');
    $("#addNewDeptModal").modal('show');
    popLocationSelOptions();
});

// add a new department
$("#btn-deptAdd").on("click", function() {
    var addDeptLocName = $("#addDeptName");
    var addDeptlocationID = $("#selAddDeptLocation");

    if (isNotEmpty(addDeptLocName)) {
        $.ajax({
            url: 'libs/php/insertDepartment.php',
            method: 'POST',
            dataType: 'json',
            data: {
                addDeptLocName: addDeptLocName.val(),
                addDeptlocationID: addDeptlocationID.val(),

            }, success: function (result) {
                populateTable();
                const newDepartment = $("#alertTxt").html('New Department Record Created');
                $("#addNewDeptModal").modal('hide');
                alertModal(newDepartment);
                
            }
        });
    }
});

//show delete department modal
$("#btn-deleteDeptModal").on('click', function () {
    $("#editDeptModal").modal('hide');
    $("#deleteDeptModal").modal('show');
    popDeptSelOptions();
});

//delete department record
$("#btn-deleteDepartment").on("click", function() {
    $("#deleteDeptModal").modal('hide');
    $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {

            const filterData = result.data.filter((a) => (a.department === $( "#deleteDepartment option:selected" ).text()));

            if (filterData.length !== 0) {
                $("#deleteModal").modal('hide');
                let deletedDepartment = $("#alertTxt").html('Error: Cannot delete department with current employees.');
                
              } else {
                $.ajax({
                    url: 'libs/php/deleteDepartmentByID.php',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        deleteDeptID: $( "#deleteDepartment option:selected" ).val()
                    },
                    success: function (result) {
                        let deletedDepartment = $("#alertTxt").html('Department Record Deleted.');
                        alertModal(deletedDepartment);
                        populateTable();
                    }
                });
            }
        }
    });
})

