//******** FUNCTIONS ************/

//function populates index.html table
function populateTable() {
    $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            console.log(result);
            $('#tableBody1').empty();
            for (let i = 0; i < result.data.length; i++) {
                $('#tableBody1').append(`
                    <tr class="item" rowID="${result.data[i].employeeID}">
                        <td id="employeeID" style="display: none;">${result.data[i].employeeID}</td>
                        <td>${result.data[i].firstName}</td>
                        <td>${result.data[i].lastName}</td>
                        <td>${result.data[i].email}</td>
                        <td>${result.data[i].department}</td>
                        <td>${result.data[i].location}</td>
                        <td>
                            <input type="button" id="btn-view" view-id="${result.data[i].employeeID}" value="View" class="btn btn-success">
                            <input type="button" id="btn-edit" edit-id="${result.data[i].employeeID}" value="Edit" class="btn btn-primary">
                            <input type="button" id="btn_delete" delete-id="${result.data[i].employeeID}" value="Delete" class="btn btn-danger">
                        </td>
                    </tr>`
                );
            }
            
        }
    });
}

//function ties a department to a location
function deptLoc() {
    var val = $( "#selDepartment option:selected, #newPersonLocation option:selected" ).val();
        if (val == 1 || val == 4 || val == 5) {
            $('#editLocation').attr('value', 'London');
        } else if (val == 2 || val == 3 ) {
            $('#editLocation').attr('value', 'New York');
        } else if (val == 7 || val == 6 || val == 12) {
            $('#editLocation').attr('value', 'Paris');
        } else if (val == 8 || val == 9) {
            $('#editLocation').attr('value', 'Munich');
        } else if (val == 10 || val == 11) {
            $('#editLocation').attr('value', 'Rome');
        } else {
            $('#editLocation').attr('value', 'Unknown');
        }
};

//function to populate department select options
function popDeptSelOptions() {
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    method: 'POST',
    dataType: 'json',
    success: function (result) {
        console.log('Departments', result);
        if (result.status.name == "ok") {
            $('#selDepartment, #newPersonDepartment, #deleteDepartment').empty();
            for (var i=0; i<result.data.length; i++) {
                $('#selDepartment, #newPersonDepartment, #deleteDepartment').append($('<option>', {
                    value: result.data[i].id,
                    text: result.data[i].name,
                }));
                
            }
        }
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
                  }));
                  
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
    $("#tableManager").modal('show');
    val = $('#newPersonLocation').find(":selected").val();
    deptLoc();
    $("#newPersonLocation").on('change',function() {
        deptLoc();
    });
});

//add a new employee 
$("#manageData").on("click", function() {
    var fName = $("#personFirstName");
    var lName = $("#personLastName");
    var pJobTitle = $("#personJobTitle");
    var pEmail = $("#personEmail");
    var pDept = $("#newPersonDepartment");
    var pLoc = $("#personLocation");

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
                pDept: pDept.val(),
                // pLoc: pLoc.val(),
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
    $("#editEmployee").modal('show');
    var editEmployID = $(this).attr('edit-id');

    $.ajax({
        url: 'libs/php/getPersonnel.php',
        method: 'POST',
        dataType: 'json',
        data: {
            id: editEmployID
        },
        success: function (result) {
            console.log(result);
            $("#editEmployID").attr('value', result.data.personnel[0].id);
            $("#editFirstName").attr('value', result.data.personnel[0].firstName);
            $("#editLastName").attr('value', result.data.personnel[0].lastName);
            $("#editJobTitle").attr('value', result.data.personnel[0].jobTitle);
            $("#editEmail").attr('value', result.data.personnel[0].email);
            $('#selDepartment option[value="' + result.data.personnel[0].departmentID +'"]').prop("selected", true);
            deptLoc();
            $("#selDepartment").on('change',function() {
                deptLoc();
            });
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
            pDept: $("#selDepartment").val(),
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
    var employID = $(this).attr('delete-id');
    $("#btn-delete").on("click", function() {
    
        $.ajax({
            url: 'libs/php/deletePersonnelByID.php',
            method: 'POST',
            dataType: 'json',
            data: {
                id: employID
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
    $("#deleteLocationModal").modal('hide');
        $("#deleteModal").modal('show');
    $("#btn-delete").on("click", function() {
        $("#deleteModal").modal('hide');
       
       $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {

            const filterData = result.data.filter((a) => (a.location === $( "#deleteLocation option:selected" ).text()));

            if (filterData.length !== 0) {
                let deletedLocation = $("#alertTxt").html('Error: Cannot delete Location with current employees.');
                alertModal(deletedLocation);
              } else {
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
            }
        }
    });
    });
})

//******** DEPARTMENT RECORDS************/

//show edit department modal
$("#editDepartment").on('click', function () {
    $("#editDeptModal").modal('show');
});

//show add new department modal
$("#btn-addDeptModal").on('click', function () {
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
        $("#deleteModal").modal('show');
    $("#btn-delete").on("click", function() {
        $("#deleteModal").modal('hide');
       
       $.ajax({
        url: 'libs/php/getAll.php',
        method: 'POST',
        dataType: 'json',
        success: function (result) {

            const filterData = result.data.filter((a) => (a.department === $( "#deleteDepartment option:selected" ).text()));

            if (filterData.length !== 0) {
                let deletedDepartment = $("#alertTxt").html('Error: Cannot delete department with current employees.');
                alertModal(deletedDepartment);
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
    });
})

