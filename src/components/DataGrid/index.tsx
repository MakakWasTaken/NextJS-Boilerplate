import { styled } from '@mui/material'
import {
  DataGridPro,
  DataGridProProps,
  GridCellModes,
  GridCellModesModel,
  GridCellParams,
} from '@mui/x-data-grid-pro'
import React, { FC, useMemo } from 'react'
import { toast } from 'sonner'

declare module '@mui/x-data-grid-pro' {
  interface FooterPropsOverrides {
    total: number
    marginLeft: number | string
  }
}

const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  '& .grey-row': {
    backgroundColor: 'rgb(110 20 20 / 7.5%)',
  },
  '& .grey-row:hover': {
    backgroundColor: 'rgb(110 20 20 / 7.5%)',
  },
  '& .grey-row:focus': {
    backgroundColor: 'rgb(110 20 20 / 7.5%)',
  },
  color: theme.palette.text.primary,
}))

const CustomDataGrid: FC<DataGridProProps> = (props) => {
  const columnVisibilityModel = useMemo(() => {
    const columnMap: { [key: string]: boolean } = {}

    for (const column of props.columns) {
      if (column.hideable) {
        columnMap[column.field] = false
      }
    }

    return columnMap
  }, [props.columns])

  const [cellModesModel, setCellModesModel] =
    React.useState<GridCellModesModel>({})

  const handleCellClick = React.useCallback(
    (params: GridCellParams) => {
      if (!params.isEditable) {
        // If we are not able to edit this cell as per datagrid configuration
        return
      }
      // To prevent update of parent in tree
      if (params.id.toString().includes('auto-generated-row')) {
        return
      }
      if (
        params.colDef.type === 'actions' ||
        params.colDef.field === '__tree_data_group__'
      ) {
        // Action cells cannot be edited.
        // Tree name column cannot be edited
        return
      }
      setCellModesModel((prevModel) => {
        // Handle edit update
        return {
          // Revert the mode of the other cells from other rows
          ...Object.keys(prevModel).reduce(
            (acc, id) => ({
              ...acc,
              [id]: Object.keys(prevModel[id]).reduce(
                (acc2, field) => ({
                  ...acc2,
                  [field]: { mode: GridCellModes.View },
                }),
                {},
              ),
            }),
            {},
          ),
          [params.id]: {
            // Revert the mode of other cells in the same row
            ...Object.keys(prevModel[params.id] || {}).reduce(
              (acc, field) => ({
                ...acc,
                [field]: { mode: GridCellModes.View },
              }),
              {},
            ),
            [params.field]: { mode: GridCellModes.Edit },
          },
        }
      })
    },
    [setCellModesModel],
  )

  const handleCellModesModelChange = React.useCallback(
    (newModel: GridCellModesModel) => {
      setCellModesModel(newModel)
    },
    [setCellModesModel],
  )

  return (
    <StyledDataGrid
      columnVisibilityModel={columnVisibilityModel}
      autoHeight
      density="standard"
      onProcessRowUpdateError={(err) => {
        toast.error(err.message || err)
      }}
      cellModesModel={cellModesModel}
      onCellModesModelChange={handleCellModesModelChange}
      onCellClick={handleCellClick}
      {...props}
    />
  )
}

export default CustomDataGrid
