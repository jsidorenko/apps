// Copyright 2017-2022 @polkadot/app-assets authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageKey, u32 } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountItem } from '../types';

import { useEffect, useState } from 'react';

import { createNamedHook, useAccounts, useApi, useIsMountedRef } from '@polkadot/react-hooks';

function transformResults (results: StorageKey<[AccountId32, u32, u32]>[][]): AccountItem[] {
  return results
    .filter((r) => !!r.length)
    .map((r) => r.map((item) => {
      const [accountId, collectionId, itemId] = item.args;

      return {
        accountId,
        collectionId,
        itemId
      };
    }))
    .flat();
}

function useAccountItemsImpl (): AccountItem[] | undefined {
  const mountedRef = useIsMountedRef();
  const { api } = useApi();
  const { allAccounts } = useAccounts();

  const acc = 'EGVQCe73TpFyAZx5uKfE1222XfkT3BSKozjgcqzLBnc5eYo';
  // const acc = 'FAfYEeXt2eL85rtERa5AHyi7RDEwBpzvcjPPouQp3rhSDtj';
  const [state, setState] = useState<AccountItem[] | undefined>();

  useEffect((): void => {
    if (!allAccounts.length) return;

    const accounts = [...allAccounts, acc];
    const promises = accounts.map((account) => api.query.uniques.account.keys(account));

    Promise.all(promises)
      .then((results) => mountedRef.current && setState(transformResults(results)))
      .catch(console.error);
  }, [allAccounts, acc, api.query.uniques.account, mountedRef]);

  return state;
}

export default createNamedHook('useAccountItems', useAccountItemsImpl);
