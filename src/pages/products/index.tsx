// ** React Imports
import { ReactNode, useState } from 'react'
import { useSelector } from 'react-redux'

// ** MUI Components
import { DataGrid } from '@mui/x-data-grid'
import { Card, Grid, Box, Button, CardHeader, Typography } from '@mui/material'

// ** Custom Component Import
import UserLayout from '../../layouts/UserLayout'
import ProductsLayout from './layout'
import Avatar from 'src/@core/components/mui/avatar'
import Chip from 'src/@core/components/mui/chip'

// ** Product slice
import { selectFetchProductsStatus, selectProductsData } from 'src/store/products'

// ** Types
import type { ProductType } from 'src/types'

// ** Constants
import { PRODUCT_STATUSES, REQUEST_STATUTES } from 'src/configs/constants'

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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const products = useSelector(selectProductsData)
  const queryStatus = useSelector(selectFetchProductsStatus)

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Products List'
            action={
              <div>
                <Button
                  size='medium'
                  variant='contained'
                  onClick={() => {
                    // setSyncModalOpened(true)
                  }}
                >
                  Synchronize with Instagram
                </Button>
              </div>
            }
          />

          <DataGrid
            autoHeight
            rowHeight={62}
            rows={products}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={queryStatus === REQUEST_STATUTES.PENDING}
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
