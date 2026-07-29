import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { getErrorMessage } from '@/shared/api'
import {
  Alert,
  Button,
  Label,
  Modal,
  PasswordInput,
  PasswordStrengthMeter,
  toast,
} from '@/shared/ui'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../model/schema'
import { useChangePasswordMutation } from '../model/use-change-password'
import { useVerifyCurrentPassword } from '../model/use-verify-current-password'

export function ChangePasswordButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <KeyRound className="size-3.5" aria-hidden />
        Изменить пароль
      </Button>

      {isOpen ? (
        <ChangePasswordModal onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  )
}

interface ChangePasswordModalProps {
  readonly onClose: () => void
}

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const mutation = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const newPassword = watch('newPassword')
  const currentPassword = watch('currentPassword')
  const { status: currentPasswordStatus, message: currentPasswordMessage } =
    useVerifyCurrentPassword(currentPassword)

  const isCurrentPasswordValid = currentPasswordStatus === 'valid'
  const isCurrentPasswordInvalid = currentPasswordStatus === 'invalid'

  function onSubmit(values: ChangePasswordFormValues): void {
    mutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess() {
          toast.success('Пароль успешно изменён')
          onClose()
        },
      },
    )
  }

  return (
    <Modal
      isOpen
      title="Изменение пароля"
      description="Введите текущий пароль и задайте новый"
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      >
        {mutation.isError ? (
          <Alert variant="destructive">
            {getErrorMessage(mutation.error, 'Не удалось изменить пароль')}
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="cp-current">Текущий пароль</Label>
          <PasswordInput
            id="cp-current"
            autoComplete="current-password"
            hasError={
              Boolean(errors.currentPassword) || isCurrentPasswordInvalid
            }
            hasSuccess={isCurrentPasswordValid}
            {...register('currentPassword')}
          />
          {currentPasswordStatus === 'checking' ? (
            <p className="text-sm text-muted-foreground">Проверяем…</p>
          ) : null}
          {currentPasswordStatus === 'valid' ? (
            <p className="text-sm text-success">Пароль верный</p>
          ) : null}
          {currentPasswordStatus === 'invalid' ? (
            <p className="text-sm text-destructive">Неверный пароль</p>
          ) : null}
          {currentPasswordStatus === 'rate_limited' ? (
            <p className="text-sm text-warning">
              {currentPasswordMessage ??
                'Слишком много проверок. Подождите немного.'}
            </p>
          ) : null}
          {currentPasswordStatus === 'idle' && currentPasswordMessage ? (
            <p className="text-sm text-destructive">{currentPasswordMessage}</p>
          ) : null}
          {errors.currentPassword &&
          currentPasswordStatus === 'idle' &&
          !currentPasswordMessage ? (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cp-new">Новый пароль</Label>
          <PasswordInput
            id="cp-new"
            autoComplete="new-password"
            hasError={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
          <PasswordStrengthMeter password={newPassword} />
          {errors.newPassword ? (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cp-confirm">Подтвердите новый пароль</Label>
          <PasswordInput
            id="cp-confirm"
            autoComplete="new-password"
            hasError={Boolean(errors.confirmNewPassword)}
            {...register('confirmNewPassword')}
          />
          {errors.confirmNewPassword ? (
            <p className="text-sm text-destructive">
              {errors.confirmNewPassword.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  )
}
