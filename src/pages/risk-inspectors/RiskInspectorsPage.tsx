import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  AddButton,
  Button,
  ConfirmDialog,
  DateInput,
  DeleteButton,
  DetailList,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  Input,
  ListPageSkeleton,
  Modal,
  Notification,
  Pagination,
  Panel,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import {
  createRiskInspector,
  deleteRiskInspector,
  queryKeys,
  searchInspectorPerson,
} from '@/api'
import { useAuth } from '@/features/auth'
import { useRiskInspectorsQuery } from '@/features/risk-indicator'
import { usePageState } from '@/hooks'
import { formatDate } from '@/lib/format'
import type { InspectorPerson, RiskInspectorRow } from '@/types/risk-inspector'

const ADD_INSPECTOR = 'add-risk-indicator-inspector'

function text(value: string | null | undefined) {
  const next = value?.trim()
  return next ? next : '—'
}

function passportText(row: RiskInspectorRow) {
  const serial = row.passport?.serial?.trim() || ''
  const number = row.passport?.number?.trim() || ''
  return [serial, number].filter(Boolean).join(' ') || '—'
}

export function RiskInspectorsPage() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const canAdd = hasPermission(ADD_INSPECTOR)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [fullName, setFullName] = usePageState('fullName', '')
  const [phone, setPhone] = usePageState('phone', '')
  const [passport, setPassport] = usePageState('passport', '')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    setPage(1)
  }, [fullName, phone, passport, pageSize])

  const filters = { fullName, phone, passport }
  const { data, isLoading, isError } = useRiskInspectorsQuery({
    ...filters,
    page,
    showCount: pageSize,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const remove = useMutation({
    mutationFn: deleteRiskInspector,
    onSuccess: (res) => {
      const ok = res.status === 1 || res.status === true || res.status === '1'
      if (!ok) {
        notify.error(res.message || t('riskInspectorsPage.deleteError'))
        return
      }
      notify.success(t('riskInspectorsPage.deleted'))
      setDeleteId(null)
      void queryClient.invalidateQueries({ queryKey: queryKeys.riskIndicator.all })
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectorsPage.deleteError')),
  })

  function resetFilters() {
    setFullName('')
    setPhone('')
    setPassport('')
    setPage(1)
  }

  return (
    <>
      <Header
        title={t('riskInspectorsPage.title')}
        actions={
          <div className="flex items-center gap-2">
            {canAdd ? (
              <AddButton onClick={() => setAddOpen(true)}>{t('common.add')}</AddButton>
            ) : null}
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t('monthlyRiskScorePage.clear')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Notification tone="warning" className="shrink-0">
            {t('riskInspectorsPage.hint')}
          </Notification>
          {isError ? (
            <ErrorMessage />
          ) : isLoading && !data ? (
            <ListPageSkeleton rows={8} />
          ) : (
            <>
              <Table storageKey="risk-inspectors">
                <THead>
                  <HeaderTR>
                    <TH className="w-12">№</TH>
                    <TH className="min-w-52">{t('riskInspectorsPage.fullName')}</TH>
                    <TH>{t('riskInspectorsPage.lastName')}</TH>
                    <TH>{t('riskInspectorsPage.firstName')}</TH>
                    <TH>{t('riskInspectorsPage.middleName')}</TH>
                    <TH className="w-40">{t('riskInspectorsPage.phone')}</TH>
                    <TH className="w-36">{t('riskInspectorsPage.passport')}</TH>
                    <TH className="w-36">PINFL</TH>
                    <TH>{t('riskInspectorsPage.birthDate')}</TH>
                    <TH>{t('riskInspectorsPage.createdAt')}</TH>
                    <TH className="w-16">{t('monthlyRiskByOrgPage.actions')}</TH>
                  </HeaderTR>
                  <FilterTR>
                    <FilterTH />
                    <FilterTH>
                      <SearchInput
                        size="sm"
                        id="inspector-name"
                        name="inspector-name"
                        label={t('riskInspectorsPage.fullName')}
                        placeholder={t('riskInspectorsPage.fullName')}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                    <FilterTH>
                      <SearchInput
                        size="sm"
                        id="inspector-phone"
                        name="inspector-phone"
                        label={t('riskInspectorsPage.phone')}
                        placeholder={t('riskInspectorsPage.phone')}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH>
                      <SearchInput
                        size="sm"
                        id="inspector-passport"
                        name="inspector-passport"
                        label={t('riskInspectorsPage.passport')}
                        placeholder={t('riskInspectorsPage.passport')}
                        value={passport}
                        onChange={(event) => setPassport(event.target.value)}
                      />
                    </FilterTH>
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                    <FilterTH />
                  </FilterTR>
                </THead>
                <TBody>
                  {rows.length === 0 ? (
                    <EmptyTR colSpan={11} />
                  ) : (
                    rows.map((row, index) => (
                      <TR key={row.id}>
                        <TD className="text-center">{(page - 1) * pageSize + index + 1}</TD>
                        <TD className="max-w-64 overflow-hidden">
                          <span className="block truncate" title={row.full_name || ''}>
                            {text(row.full_name)}
                          </span>
                        </TD>
                        <TD className="max-w-40 overflow-hidden">
                          <span className="block truncate" title={row.last_name || ''}>
                            {text(row.last_name)}
                          </span>
                        </TD>
                        <TD className="max-w-36 overflow-hidden">
                          <span className="block truncate" title={row.first_name || ''}>
                            {text(row.first_name)}
                          </span>
                        </TD>
                        <TD className="max-w-40 overflow-hidden">
                          <span className="block truncate" title={row.middle_name || ''}>
                            {text(row.middle_name)}
                          </span>
                        </TD>
                        <TD className="text-center">{text(row.phone)}</TD>
                        <TD className="text-center">{passportText(row)}</TD>
                        <TD className="text-center">{text(row.passport?.pinfl)}</TD>
                        <TD className="text-center">{formatDate(row.birth_date) || '—'}</TD>
                        <TD className="text-center">{formatDate(row.created_at) || '—'}</TD>
                        <TD className="text-center">
                          <DeleteButton onClick={() => setDeleteId(row.id)} />
                        </TD>
                      </TR>
                    ))
                  )}
                </TBody>
              </Table>
              <Pagination
                className="shrink-0"
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </PageMain>

      <AddInspectorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false)
          void queryClient.invalidateQueries({ queryKey: queryKeys.riskIndicator.all })
        }}
      />
      <ConfirmDialog
        open={deleteId != null}
        loading={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId != null) remove.mutate(deleteId)
        }}
      />
    </>
  )
}

function AddInspectorModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [seria, setSeria] = useState('')
  const [number, setNumber] = useState('')
  const [birthday, setBirthday] = useState('')
  const [person, setPerson] = useState<InspectorPerson | null>(null)

  function close() {
    setSeria('')
    setNumber('')
    setBirthday('')
    setPerson(null)
    onClose()
  }

  const search = useMutation({
    mutationFn: searchInspectorPerson,
    onSuccess: (res) => {
      const found = Number(res.status) === 200 && res.data
      if (!found || !res.data) {
        setPerson(null)
        notify.error(res.message || t('riskInspectorsPage.notFound'))
        return
      }
      setPerson(res.data)
      notify.success(t('riskInspectorsPage.found'))
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectorsPage.searchError')),
  })

  const save = useMutation({
    mutationFn: createRiskInspector,
    onSuccess: (res) => {
      const ok = res.status === 1 || res.status === true || res.status === '1'
      if (!ok) {
        notify.error(res.message || t('riskInspectorsPage.saveError'))
        return
      }
      notify.success(t('riskInspectorsPage.saved'))
      setSeria('')
      setNumber('')
      setBirthday('')
      setPerson(null)
      onSaved()
    },
    onError: (error: Error) => notify.error(error.message || t('riskInspectorsPage.saveError')),
  })

  function submitSearch() {
    const passportSeria = seria.trim().toUpperCase()
    const passportNumber = number.trim()
    if (!/^[A-Z]{2}$/.test(passportSeria)) {
      notify.warning(t('riskInspectorsPage.seriaRule'))
      return
    }
    if (!/^\d{7}$/.test(passportNumber)) {
      notify.warning(t('riskInspectorsPage.numberRule'))
      return
    }
    if (!birthday) {
      notify.warning(t('riskInspectorsPage.birthRequired'))
      return
    }
    setPerson(null)
    search.mutate({
      passport_seria: passportSeria,
      passport_number: passportNumber,
      birthday,
    })
  }

  const fullName = [person?.last_name, person?.first_name, person?.middle_name]
    .filter(Boolean)
    .join(' ')

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('riskInspectorsPage.addTitle')}
      sizeClassName="max-w-3xl"
      headerExtra={
        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          loading={search.isPending}
          onClick={submitSearch}
        >
          {t('riskInspectorsPage.search')}
        </Button>
      }
      footer={
        person ? (
          <div className="flex justify-end">
            <Button variant="primary" loading={save.isPending} onClick={() => save.mutate(person)}>
              {t('common.save')}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label={t('riskInspectorsPage.seria')}
          required
          value={seria}
          maxLength={2}
          placeholder="AA"
          onChange={(event) => setSeria(event.target.value.toUpperCase().replace(/[^A-Za-z]/g, ''))}
        />
        <Input
          label={t('riskInspectorsPage.number')}
          required
          value={number}
          maxLength={7}
          inputMode="numeric"
          placeholder="1234567"
          onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 7))}
        />
        <DateInput
          label={t('riskInspectorsPage.birthDate')}
          required
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
        />
      </div>
      {person ? (
        <Panel className="mt-4 p-3">
          <DetailList
            items={[
              { label: t('riskInspectorsPage.fullName'), value: fullName || '—' },
              { label: t('riskInspectorsPage.lastName'), value: text(person.last_name) },
              { label: t('riskInspectorsPage.firstName'), value: text(person.first_name) },
              { label: t('riskInspectorsPage.middleName'), value: text(person.middle_name) },
              { label: t('riskInspectorsPage.jshir'), value: text(person.passport_jshir) },
              {
                label: t('riskInspectorsPage.passport'),
                value:
                  [person.passport_seria, person.passport_number].filter(Boolean).join(' ') || '—',
              },
              {
                label: t('riskInspectorsPage.birthDate'),
                value: formatDate(person.birthday) || '—',
              },
              {
                label: t('riskInspectorsPage.gender'),
                value:
                  person.gender === '1'
                    ? t('riskInspectorsPage.male')
                    : person.gender === '2'
                      ? t('riskInspectorsPage.female')
                      : '—',
              },
              {
                label: t('riskInspectorsPage.givenPlace'),
                value: text(person.passport_given_place),
              },
              {
                label: t('riskInspectorsPage.givenDate'),
                value: formatDate(person.passport_given_date) || '—',
              },
            ]}
          />
        </Panel>
      ) : null}
    </Modal>
  )
}
