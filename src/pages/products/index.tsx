// ** React Imports
import { ReactNode, useState } from 'react'

// ** MUI Components
import {
  DataGrid,
  GridRowId,
  GridValidRowModel,
  GridRowParams,
  GRID_CHECKBOX_SELECTION_COL_DEF
} from '@mui/x-data-grid'
import { Card, Grid, Box, Button, CardHeader, Typography, Stack, IconButton, Checkbox } from '@mui/material'

// ** Custom Component Import
import UserLayout from '../../layouts/UserLayout'
import ProductsLayout from './layout'
import Avatar from 'src/@core/components/mui/avatar'
import Chip from 'src/@core/components/mui/chip'
import SyncModal from './components/SyncModal'
import AddToShopModal from './components/AddToShopModal'

// ** Product slice
import {
  fetchDBProducts,
  addToShopProducts,
  selectIntersectedProducts,
  selectFetchClientProductsStatus,
  selectShopifyProductsStatus,
  fetchProductCategories
} from 'src/store/products'
import { useAppDispatch, useTypedSelector } from 'src/store'

// ** Hooks
import useAuth from 'src/hooks/useAuth'

// ** Types
import type { ProductType } from 'src/types'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

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
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    renderCell: ({ row, ...props }: RowProps & GridValidRowModel) => {
      return (
        <Checkbox
          disabled={!!row.shopifyProductId}
          checked={row.shopifyProductId ? true : props.value}
          onClick={() => {
            props.api.selectRow(row.id, !props.value)
          }}
        />
      )
    }
  },
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
    flex: 0.15,
    minWidth: 150,
    field: 'status',
    headerName: 'Status',
    renderCell: ({ row }: RowProps) => {
      return (
        <Chip
          rounded
          size='small'
          skin='light'
          color={row.shopifyProductId ? 'success' : 'info'}
          label={row.shopifyProductId ? 'Added to store' : 'Pending'}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    flex: 0.2,
    minWidth: 200,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: RowProps) => {
      return (
        <Stack flexDirection='row' gap={2}>
          <IconButton
            onClick={() => {
              window.open(row.permalink, '_blank')?.focus()!
            }}
          >
            <Icon icon='skill-icons:instagram' fontSize={18} />
          </IconButton>

          {row.shopifyProductId && (
            <IconButton>
              <Box
                component='a'
                href={`shopify://admin/products/${row.shopifyProductId}`}
                target='_blank'
                sx={{ width: 20, height: 20 }}
              >
                <Icon icon='logos:shopify' fontSize={20} />
              </Box>
            </IconButton>
          )}
        </Stack>
      )
    }
  }
]

const ProductsPage = () => {
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([])
  const [page, setPage] = useState(0)
  const [syncModalOpened, setSyncModalOpened] = useState(false)
  const [addToShopModalOpened, setAddToShopModalOpened] = useState(false)

  // ** Hooks
  const { shop } = useAuth()

  const products = useTypedSelector(selectIntersectedProducts)
  const clientQueryStatus = useTypedSelector(selectFetchClientProductsStatus)
  const shopifyQueryStatus = useTypedSelector(selectShopifyProductsStatus)

  const dispatch = useAppDispatch()

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

  const handleAddProductsToShop = async (vertexAIEnabled: boolean) => {
    if (vertexAIEnabled) {
      await dispatch(fetchProductCategories())
    }

    await dispatch(addToShopProducts({ productIds: selectionModel, vertexAIEnabled }))

    if (shop?.id) {
      dispatch(fetchDBProducts({ shopId: shop.id }))
    }

    setSelectionModel([])
    handleToggleAddToShopModal()
  }

  const handleToggleSyncModal = () => {
    setSyncModalOpened(!syncModalOpened)
  }

  const handleCloseSyncModal = () => {
    setSyncModalOpened(false)
  }

  const handleToggleAddToShopModal = () => {
    setAddToShopModalOpened(!addToShopModalOpened)
  }

  return (
    <>
      <SyncModal opened={syncModalOpened} onCloseModal={handleCloseSyncModal} />

      <AddToShopModal
        loading={shopifyQueryStatus === REQUEST_STATUTES.PENDING}
        opened={addToShopModalOpened}
        onCloseModal={handleToggleAddToShopModal}
        onAddProducts={handleAddProductsToShop}
      />

      <Grid container spacing={6.5}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Products List'
              action={
                <Stack flexDirection='row' gap={3}>
                  <Button
                    size='medium'
                    variant='outlined'
                    disabled={!selectionModel.length}
                    onClick={handleToggleAddToShopModal}
                  >
                    Add to shop products
                  </Button>

                  <Button size='medium' variant='contained' onClick={handleToggleSyncModal}>
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
              // disableRowSelectionOnClick
              pageSizeOptions={[PAGE_SIZE]}
              paginationModel={{
                page,
                pageSize: PAGE_SIZE
              }}
              onPaginationModelChange={({ page }) => setPage(page)}
              loading={clientQueryStatus === REQUEST_STATUTES.PENDING}
              checkboxSelection
              onRowSelectionModelChange={handleSelectRows}
              rowSelectionModel={selectionModel}
              isRowSelectable={(params: GridRowParams) => !params.row.shopifyProductId}
              sx={{
                // disable cell selection style
                '.MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
                // pointer cursor on ALL rows
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer'
                },
                '& .MuiDataGrid-row': {
                  userSelect: 'none'
                }
              }}
              // slots={{
              //   baseCheckbox: Checkbox
              // }}
              // slotProps={{
              //   baseCheckbox: {
              // disabled: true
              // checkedIcon: <Checkbox checked={true} />,
              // icon: <Checkbox checked={true} />
              //   }
              // }}
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

ProductsPage.getLayout = (page: ReactNode) => (
  <UserLayout>
    <ProductsLayout>{page}</ProductsLayout>
  </UserLayout>
)

export default ProductsPage
