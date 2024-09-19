// ** React Imports
import { Fragment, useEffect } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Theme, styled } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Checkbox } from '@mui/material'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Types
import type { AuthValuesType, InstagramSetupFormValues } from 'src/types'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const schema = yup.object().shape({
  email: yup.string().email().required('Shop email is required!'),
  shopName: yup.string().required('Shop name is required!'),
  shopDescription: yup.string().required('Shop description is required!')
})

const defaultValues = {
  email: '',
  shopName: '',
  shopDescription: '',
  isVertaxEnabled: false
}

type Props = {
  theme: Theme
  auth: AuthValuesType
  onSubmit: (data: InstagramSetupFormValues) => void
}

const InstagramAccountSetupFormView = ({ auth, theme, onSubmit }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<InstagramSetupFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (auth?.user?.email) {
      setValue('email', auth.user.email)
    }

    if (auth.selectedInstagramAccount) {
      setValue('shopName', auth.selectedInstagramAccount.name || auth.selectedInstagramAccount.username)
      setValue('shopDescription', auth.selectedInstagramAccount.biography || '')
    }
  }, [auth, setValue])

  return (
    <Fragment>
      <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={34} viewBox='0 0 32 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            fill={theme.palette.primary.main}
            d='M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z'
          />
          <path
            fill='#161616'
            opacity={0.06}
            fillRule='evenodd'
            clipRule='evenodd'
            d='M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z'
          />
          <path
            fill='#161616'
            opacity={0.06}
            fillRule='evenodd'
            clipRule='evenodd'
            d='M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z'
          />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            fill={theme.palette.primary.main}
            d='M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z'
          />
        </svg>
        <Typography variant='h3' sx={{ ml: 2.5, fontWeight: 700 }}>
          {themeConfig.templateName}
        </Typography>
      </Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Your shop is almost ready!
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Please provide us with additional information about your shop
        </Typography>
      </Box>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <CustomTextField
                autoFocus
                fullWidth
                label='Email'
                placeholder='Enter your Email'
                error={Boolean(errors.email)}
                {...(errors.email && { helperText: errors.email.message })}
                {...field}
              />
            )}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Controller
            name='shopName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                label='Shop name'
                placeholder='Enter your shop name'
                error={Boolean(errors.shopName)}
                {...(errors.shopName && { helperText: errors.shopName.message })}
                {...field}
              />
            )}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Controller
            name='shopDescription'
            control={control}
            render={({ field }) => (
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Description'
                type='textarea'
                placeholder='Enter description of your shop'
                error={Boolean(errors.shopDescription)}
                {...(errors.shopDescription && { helperText: errors.shopDescription.message })}
                {...field}
              />
            )}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Controller
            name='isVertaxEnabled'
            control={control}
            render={({ field: { value, ...params } }) => (
              <FormControlLabel
                control={<Checkbox size='small' checked={value} sx={{ mb: -2, mt: -2.5, ml: -2.75 }} {...params} />}
                label='Use Vertex AI to generate products content.'
                componentsProps={{
                  typography: {
                    variant: 'body2'
                  }
                }}
              />
            )}
          />
        </Box>
        <Box
          sx={{
            mb: 1.75,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        ></Box>
        <Button fullWidth type='submit' variant='contained' sx={{ mb: 4 }}>
          Continue
        </Button>
        <Divider
          sx={{
            color: 'text.disabled',
            '& .MuiDivider-wrapper': { px: 6 },
            fontSize: theme.typography.body2.fontSize,
            my: theme => `${theme.spacing(6)} !important`
          }}
        >
          or
        </Divider>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography href={APP_ROUTES.INSTAGRAM_ACCOUNT} component={LinkStyled}>
            Choose another account
          </Typography>
        </Box>
      </form>
    </Fragment>
  )
}

export default InstagramAccountSetupFormView
