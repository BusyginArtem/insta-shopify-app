// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'
import AuthIllustrationWrapper from 'src/views/pages/auth/AuthIllustrationWrapper'

// ** Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 680,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '25rem' }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

const schema = yup.object().shape({
  email: yup.string().email().min(1).required(),
  shopName: yup.string().min(1).required(),
  shopDescription: yup.string().min(1).required(),
})

const defaultValues = {
  email: '',
  shopName: '',
  shopDescription: ''
}

const InstagramAccountSetupFormView = ({ auth, theme, onSubmit }) => {
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (auth.user) {
      setValue('email', auth.user.email)
    }

    if (auth.selectedInstagramAccount) {
      setValue('shopName', auth.selectedInstagramAccount.name || auth.selectedInstagramAccount.username)
      setValue('shopDescription', auth.selectedInstagramAccount.biography)
    }
  }, [auth])

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
          {`Your shop is almost ready!`}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Please provide us with additional information about your shop
        </Typography>
      </Box>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 4 }}>
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                autoFocus
                fullWidth
                label='Email'
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder='Enter your Email'
                error={Boolean(errors.email)}
                {...(errors.email && { helperText: errors.email.message })}
              />
            )}
          />
        </Box>
        <Box sx={{ mb: 4 }}>
          <Controller
            name='shopName'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                label='Shop name'
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder='Enter your shop name'
                error={Boolean(errors.shopName)}
                {...(errors.shopName && { helperText: errors.shopName.message })}
              />
            )}
          />
        </Box>
        <Box sx={{ mb: 4 }}>
        <Controller
            name='shopDescription'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur } }) => (
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Description'
                type="textarea"
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder='Enter description of your shop'
                error={Boolean(errors.shopDescription)}
                {...(errors.shopDescription && { helperText: errors.shopDescription.message })}
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
        >
          
        </Box>
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
          <Typography href='/instagram-account' component={LinkStyled}>
            Choose another account
          </Typography>
        </Box>
      </form>
    </Fragment>
  )
}

export default InstagramAccountSetupFormView


