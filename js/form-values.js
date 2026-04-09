$(document).ready(function() {
    function getFormValues() {
        var formValues = {};

        // Example inputs from the provided form snippet
        formValues.RegistrationType = $('#guideContainer-rootPanel-panel_1858746179-registrationtype1551_1047628006___widget').val();
        formValues.PrimaryIndicationId = $('#guideContainer-rootPanel-panel_1858746179-PrimaryIndicationId1551995494631___widget').val();
        formValues.FirstName = $('#guideContainer-rootPanel-panel_1858746179-panel-firstname15519111652___widget').val();
        formValues.LastName = $('#guideContainer-rootPanel-panel_1858746179-panel-lastname155191117131___widget').val();
        formValues.EmailAddress = $('#guideContainer-rootPanel-panel_1858746179-guidetextbox___widget').val();
        formValues.MobilePhoneNumber = $('#guideContainer-rootPanel-panel_1858746179-guidetextbox_1450528___widget').val();

        // Example for radio buttons (get checked value)
        formValues.IsCurrentlyTaking = $('#guideContainer-rootPanel-panel_1858746179-panel_640980378-guideradiobutton__ input[type=radio]:checked').val();
        formValues.importantInformation = $('#guideContainer-rootPanel-panel_1858746179-panel_1850045097_cop-guideradiobutton_cop__ input[type=radio]:checked').val();
        formValues.doYouHaveAnAppointment = $('#guideContainer-rootPanel-panel_1858746179-panel1640158898351-guideradiobutton_cop__ input[type=radio]:checked').val();

        // Example for checkbox (get checked state)
        formValues.receiveTextMsgsCheckbox = $('#guideContainer-rootPanel-panel_1858746179-panel_814260942_copy-termsandconditionsch___1_widget').is(':checked');

        // Add more fields as needed following the pattern above

        return formValues;
    }

    // Example usage: log the form values on form submit or button click
    $('#yourFormId').on('submit', function(e) {
        e.preventDefault();
        var values = getFormValues();
        console.log(values);
        // You can do further processing here, like AJAX submission
    });
});
