var FacePlusPlus = {
    api_key: config.FACEPLUSPLUS_API_KEY,
    api_secret: config.FACEPLUSPLUS_API_SECRET,
    api_host: 'https://api-us.faceplusplus.com/facepp/v3/'
};

// send facial analysis request to Face++'s API
FacePlusPlus.detect = function(image_data, callback, is_url) {
    var url = this.api_host + 'detect';
    url += '?return_attributes=age,gender&';
    url += '&api_key=' + this.api_key + '&api_secret=' + this.api_secret;
    var data;
    if (is_url) {
        data = {};
        url += '&image_url=' + image_data;
    } else {
        data = new FormData();
        data.append('image_file', image_data, image_data.name);
    }
    $.ajax(url, {
        type: 'POST',
        data: data,
        processData: false,
        success: callback,
        error: callback,
        contentType: false,
    });
};

// process Face++'s API's facial analysis response
FacePlusPlus.handleResponse = function(response, scorecard) {
    var facePlusPlusJSON = response;
    if (!('faces' in facePlusPlusJSON)) {
        $("#faceplusplus-response").html('Photo incompatible with Face++');
        $('#comparison_table')
            .find('.faceplusplus_gender, .faceplusplus_age')
            .html('No face detected');
        scorecard.setFacePlusPlusFaceDetected(false);
        return;
    } else if (facePlusPlusJSON.faces.length === 0) {
        $('#comparison_table')
            .find('.faceplusplus_gender, .faceplusplus_age')
            .add('#faceplusplus-response')
            .html('No face detected');
        scorecard.setFacePlusPlusFaceDetected(false);
        return;
    } else {
        var attributes = facePlusPlusJSON.faces[0].attributes;
        $('#comparison_table')
            .find('.faceplusplus_gender')
            .html((attributes.gender.value).toUpperCase()[0])
            .end()
            .find('.faceplusplus_age')
            .html(attributes.age.value);
        scorecard.setFacePlusPlusGender((attributes.gender.value).toUpperCase()[0]);
        scorecard.setFacePlusPlusAge(parseInt(attributes.age.value));
        scorecard.setFacePlusPlusFaceDetected(true);

        var face = facePlusPlusJSON.faces[0].face_rectangle;
        var boundingBox = {
            top: face.top,
            left: face.left,
            width: face.width,
            height: face.height
        };
        $("#faceplusplus-response").html(JSON.stringify(attributes, null, 4));
        return boundingBox;
    }
};