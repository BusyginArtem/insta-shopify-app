// ** React Imports
import { ReactNode, useState } from 'react'

// ** MUI Components
import { DataGrid, GridRowId } from '@mui/x-data-grid'
import { Card, Grid, Box, Button, CardHeader, Typography, Stack } from '@mui/material'

// ** Custom Component Import
import UserLayout from '../../layouts/UserLayout'
import ProductsLayout from './layout'
import Avatar from 'src/@core/components/mui/avatar'
import Chip from 'src/@core/components/mui/chip'

// ** Product slice
import { selectFetchClientProductsStatus, selectClientProductsData } from 'src/store/products'
import { useTypedSelector } from 'src/store'

// ** Types
import type { ProductType } from 'src/types'

// ** Constants
import { PRODUCT_STATUSES, REQUEST_STATUTES } from 'src/configs/constants'

const PAGE_SIZE = 5

const status = {
  [PRODUCT_STATUSES.ACTIVE]: 'success',
  [PRODUCT_STATUSES.DRAFT]: 'warning',
  [PRODUCT_STATUSES.ARCHIVED]: 'secondary'
} as const

type RowProps = { row: ProductType }

const renderProduct = (row: ProductType) => {
  if (row.thumbnail) {
    return <Avatar src={row.thumbnail} sx={{ mr: 2.5, width: 38, height: 38 }} />
  }
}

const columns = [
  {
    field: 'thumbnail',
    minWidth: 60,
    flex: 0.1,
    headerName: 'Product',
    renderCell: ({ row }: RowProps) => {
      return <Box sx={{ display: 'flex', alignItems: 'center' }}>{renderProduct(row)}</Box>
    }
  },
  {
    field: 'type',
    minWidth: 120,
    flex: 0.1,
    headerName: 'Type',
    renderCell: ({ row }: RowProps) => {
      let type = 'Unknown'

      switch (row.type) {
        case 'image':
          type = 'IMAGE'
          break

        case 'video':
          type = 'VIDEO'
          break

        case 'carousel_album':
          type = 'ALBUM'
          break
      }

      return (
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
          {type}
        </Typography>
      )
    }
  },
  {
    flex: 0.5,
    field: 'title',
    minWidth: 200,
    headerName: 'Name',
    renderCell: ({ row }: RowProps) => {
      return (
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize' }}>
          {row.title}
        </Typography>
      )
    }
  },
  {
    flex: 0.125,
    minWidth: 120,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }: RowProps) => {
      return (
        <Chip
          rounded
          size='small'
          skin='light'
          color={status[row.status]}
          label={row.status}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0.125,
    minWidth: 120,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: RowProps) => {
      return (
        <Button
          size='small'
          variant='outlined'
          color='secondary'
          onClick={() => {
            window.open(row.permalink, '_blank')?.focus()!
          }}
        >
          Go to IG
        </Button>
      )
    }
  }
]

const ProductsPage = () => {
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([])
  const [page, setPage] = useState(0)
  console.log('%c selectionModel', 'color: green; font-weight: bold;', selectionModel)
  const products = useTypedSelector(selectClientProductsData)
  const queryStatus = useTypedSelector(selectFetchClientProductsStatus)

  const handleSelectRows = (newSelectionModel: GridRowId[]) => {
    const offset = page * PAGE_SIZE
    const currentPageRows = products.slice(offset, offset + PAGE_SIZE)

    setSelectionModel(currentSelectionModel => {
      if (!Array.isArray(currentSelectionModel) || !Array.isArray(newSelectionModel)) {
        return currentSelectionModel
      }

      return [
        ...new Set([
          ...currentSelectionModel.filter(id => newSelectionModel.includes(id)),
          ...newSelectionModel.filter(id => currentPageRows.findIndex(row => row.id === id) > -1)
        ])
      ]
    })
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Products List'
            action={
              <Stack flexDirection='row' gap={3}>
                <Button
                  size='medium'
                  variant='contained'
                  disabled={!selectionModel.length}
                  onClick={() => {
                    // setSyncModalOpened(true)
                  }}
                >
                  Add to shop products
                </Button>

                <Button
                  size='medium'
                  variant='outlined'
                  onClick={() => {
                    // setSyncModalOpened(true)
                  }}
                >
                  Synchronize with Instagram
                </Button>
              </Stack>
            }
          />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={products}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[PAGE_SIZE]}
            paginationModel={{
              page,
              pageSize: PAGE_SIZE
            }}
            onPaginationModelChange={({ page }) => setPage(page)}
            loading={queryStatus === REQUEST_STATUTES.PENDING}
            checkboxSelection
            onRowSelectionModelChange={handleSelectRows}
            rowSelectionModel={selectionModel}
            sx={{
              // disable cell selection style
              '.MuiDataGrid-cell:focus': {
                outline: 'none'
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

ProductsPage.getLayout = (page: ReactNode) => (
  <UserLayout>
    <ProductsLayout>{page}</ProductsLayout>
  </UserLayout>
)

export default ProductsPage
