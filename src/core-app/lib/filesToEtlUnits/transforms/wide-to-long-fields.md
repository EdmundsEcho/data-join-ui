## Wide-to-long-fields documentation

Functionality:

✅ Seed when more than one mvalue is detected for the first time
   ⚠️  will not have the factor nor new mvalue names; cannot
      instantiate the related fields until those values are provided.
✅ Instantiate field when mvalue name is provided
✅ Instantiate field when a factor name is provided
✅ Add a new factor
✅ Remove a factor
✅ Edit the name of a factor or mvalue
✅ Change the purpose of a factor (purpose: mcomp | mspan)
   ... change the field based on purpose.
✅ For each factor, create a map fieldname -> factor value
✅ Edit the map: fieldname -> factor value
✅ Validate the user input
✅ Rebuild the configuration considering the user input

### Concepts:

   factor -> etl field ...each factor generates an etl field

   [file fields] -> factor
      ...a collection (series) maps to a collection of factor values
      ...a collection (series) is used over and over for each factor

   sources from wide view mvalues (series) -> a single long-view mvalue

   config -> computed fields -> fields with user-input

### Tasks:

✅  Build the configuration object from a headerView
✅  Provide callbacks required to update the object
✅  Support the pre-processing of the pivot function


Return type of the interface
This module operates on ::headerView
                          ^^^^^^^^^^

    headerView -> headerView with wideToLongView ui

This is a "file" concept.  In the file paradigm we are creating a
configuration for a new `field-alias`; a concept that will operate as fodder
for the `pivot` transform.

### Examples

e.g., two factor encoded in a series of mvalues:

fields ["jan-trx", "feb-trx", "jan-nrx", "feb-nrx"] -> date
fields ["jan-trx", "feb-trx", "jan-nrx", "feb-nrx"] -> rx-type

| Information | file/header | etl-field/unit |
| .. | .. | .. |
| mvalue field-name/alias | factor | etl-field (component or time/date) |
| etl-mvalue | stacking of mvalue fields | etl-mvalue |


e.g., for the factor "Rx-type"
factor "rx-type" has levels ["NRx", "TRx"]
```js
map-fieldnames = {
  "jan-nrx": NRx
  "feb-nrx": NRx
  "jan-trx": TRx
  "feb-trx": TRx
}
```

factor "date" has levels ["jan", "feb"]
```js
map-fieldnames = {
  "jan-nrx": jan
  "feb-nrx": feb
  "jan-trx": jan
  "feb-trx": feb
}
```

Appends the following to headerView

```js
"wideToLongFieldsConfig": {
    "config": {
      "mvalue": "alias",
      "factors": [
        "alias"
      ]
    },
    "fields": {                // count: # of factors + one mvalue
      "field-alias": {
        "enabled": "Bool",
        "field-alias": "String",
        "purpose": "ENUM",
        "header-idxs": [         // # of factors | null for mvalue
          "Integer"
        ],
        "field-aliases": [       // null for mvalue
          "String"
        ],
        "map-fieldnames": {      // null for mvalue
          "arrows": {
            "field-alias": "field-alias-value"
          }
        }
      }
    }
  },
  "implied-mvalue": {
    "config": {
      "mvalue": "alias",
      "mspan": "alias"
    },
    "field": {
      "enabled": "Bool",
      "field-alias": "String",
      "purpose": "mvalue",
      "header-idx": "Integer",
      "map-symbol": "CONST 1"
    }
  }

:: {[field], Integer} -> factors::[{name,purpose}] -> wideToLongFieldsConfig::{..}
             ^^^^^^^ :: nrows

```

