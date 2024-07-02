# Errors

## Inpsection error

Returned when making the initial request.

```json
{
  "args": ["Unsupported filetype: .xlsx"],
  "code": 501,
  "extension": ".xlsx",
  "filename": "/shared/datafiles/db11bd4a-1173-4875-a6b4-dcc7bb5db2b7/dropbox/4bdff8/lE0WdposqDkAAAAAABppzg/productA_Units_short.xlsx",
  "message": "Unsupported filetype: .xlsx",
  "project_id": "db11bd4a-1173-4875-a6b4-dcc7bb5db2b7",
  "status": "Error"
}
```

## Matrix error

Returned using the polling-machine. The error object is wrapped by the polling-machine
interface:

```json
{
    "results": JobResults,
    "status": JobStatus,
    "error?": Error,
}
```

```json
{
  "results": "stopped",
  "status": "Failed"
  "error": {
    "args": [
      "The derived field is not yet supported: ratio"
    ],
    "code": 501,
    "function": "ratio",
    "message": "The derived field is not yet supported: ratio",
    "project_id": "f188e2d7-0278-49f4-8f22-a1a7c49d6ba6",
    "status": "Error",
    "type": "UnsupportedDerivedField"
  },
}
```

# Cancelling a request

## Celery - Cancel Inspection

filename: `/v1/inspection/ab9791c7-5c2d-46d0-ad5e-57cdff17c8bd/392.989553705`

pid: `8c9c3330-cb32-4d94-be98-76524cab3196`

## Core app - Cancel Workbench

filename: `/v1/extraction/ab9791c7-5c2d-46d0-ad5e-57cdff17c8bd/401.005579977`

pid: `909`
