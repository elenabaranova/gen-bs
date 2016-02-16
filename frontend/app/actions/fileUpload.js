import config from '../../config'

/*
 * action types
 */
export const CHANGE_FILE_FOR_UPLOAD      = 'CHANGE_FILE_FOR_UPLOAD'
export const REQUEST_FILE_UPLOAD         = 'REQUEST_FILE_UPLOAD'
export const RECEIVE_FILE_UPLOAD         = 'RECEIVE_FILE_UPLOAD'
export const FILE_UPLOAD_CHANGE_PROGRESS = 'FILE_UPLOAD_CHANGE_PROGRESS'

/*
 * action creators
 */
export function changeFileForUpload(files) {
  return {
    type: CHANGE_FILE_FOR_UPLOAD,
    files
  }
}

function requestFileUpload() {
  return {
    type: REQUEST_FILE_UPLOAD
  }
}

function receiveFileUpload(json) {
  return {
    type: RECEIVE_FILE_UPLOAD,
    operationId: json.operation_id,
  }
}

export function uploadFile(files) {
  return ( dispatch, getState )  => {

    dispatch(requestFileUpload())
    dispatch(changeFileUploadProgress(0, 'ajax'))

    const formData = new FormData()
    formData.append('sample', getState().fileUpload.files[0]);

    return $.ajax(config.URLS.FILE_UPLOAD, {
        'type': 'POST',
        'headers': { "X-Session-Id": getState().auth.sessionId },
        'data': formData,
        'contentType': false,
        'processData': false,
         'xhrFields': {
          // add listener to XMLHTTPRequest object directly for progress (jquery doesn't have this yet)
            'onprogress': function(progress) {
              console.log(progress);
              // calculate upload progress
              var percentage = Math.floor((progress.total / progress.total) * 100);
              // log upload progress to console
              console.log('progress', percentage);
              dispatch(changeFileUploadProgress(percentage, 'ajax'))
              if (percentage === 100) {
                  console.log('DONE!');
              }
            }
        }
      })
      .done(json => {
        dispatch(receiveFileUpload(json));
      })
      .fail(err => {
        console.error('Upload FAILED: ', err.responseText);
      });
  }

}


export function changeFileUploadProgress(progressValueFromAS, progressStatusFromAS) {
  return {
    type: FILE_UPLOAD_CHANGE_PROGRESS,
    progressValueFromAS,
    progressStatusFromAS
  }
}


