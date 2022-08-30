import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import algoliasearch from 'algoliasearch/lite'
import { InstantSearch } from 'react-instantsearch-hooks-web'
import Autocomplete from '../components/Autocomplete'

const Home: NextPage = () => {
  const algoliaClient = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
  )

  const searchClient = {
    ...algoliaClient,
    // returns no result on empty query
    search: (requests) => {
      if (requests.every(({ params }) => !params.query)) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0
          }))
        })
      }

      return algoliaClient.search(requests)
    }
  }

  return (
    <div className={styles.container}>
      <InstantSearch
        searchClient={searchClient}
        indexName={process.env.ALGOLIA_INDEX_NAME}
      >
        <Autocomplete
          placeholder='Search'
          detachedMediaQuery='none'
          openOnFocus
          searchClient={searchClient}
        />
      </InstantSearch>
    </div>
  )
}

export default Home
