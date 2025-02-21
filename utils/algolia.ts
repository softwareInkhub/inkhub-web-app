'use client';
import type { SearchResponse } from 'algoliasearch/lite';

interface AlgoliaSearchClient {
  search(requests: readonly any[]): Promise<SearchResponse>;
}

// Initialize the Algolia client
const appId = '6RG1RSAU2A';
const searchApiKey = '79af16dea2cdd763d6998d4ebdbd681d';

// Create the search client
const searchClient: AlgoliaSearchClient = {
  async search(requests) {
    console.log('Raw search requests:', requests);

    // Check if it's a trending query
    const isTrendingQuery = requests.some(req => 
      req.indexName === 'shopify_collections' && req.query === ''
    );

    // For empty non-trending queries
    if (!isTrendingQuery && requests.every(({ params }) => !params?.query)) {
      console.log('Empty query detected, returning empty results');
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 0,
          exhaustiveNbHits: true,
          query: '',
          params: '',
        })),
      });
    }

    // Prepare the search requests with proper parameters
    const modifiedRequests = requests.map(req => ({
      indexName: req.indexName,
      query: req.query,
      params: {
        ...req.params,
        query: req.query,
        hitsPerPage: req.indexName === 'shopify_collections' ? 4 : 20,
      }
    }));

    console.log('Modified requests:', modifiedRequests);

    // Make the search request
    const searchEndpoint = `https://${appId}-dsn.algolia.net/1/indexes/*/queries`;
    
    return fetch(searchEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-API-Key': searchApiKey,
        'X-Algolia-Application-Id': appId,
      },
      body: JSON.stringify({ 
        requests: modifiedRequests.map(req => ({
          ...req,
          params: new URLSearchParams(req.params).toString()
        }))
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Parsed response data:', data);
      if (!data || !data.results) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from Algolia');
      }
      return data;
    })
    .catch(error => {
      console.error('Search request failed:', error);
      throw error;
    });
  }
};

// Direct search functions with proper parameters
const productsIndex = {
  search: (query: string) => {
    console.log('Initiating products search:', query);
    return searchClient.search([{
      indexName: 'shopify_products',
      query,
      params: {
        query,
        attributesToRetrieve: [
          'objectID',
          'title',
          'handle',
          'variants',
          'priceRange'
        ],
        hitsPerPage: 20
      }
    }])
    .then(response => {
      console.log('Raw product hits:', response.results[0].hits);
      const result = response.results[0];
      console.log('Raw Algolia hit example:', result.hits[0]);
      return {
        ...result,
        hits: result.hits.map(hit => {
          console.log('Processing hit:', hit);
          const price = hit.priceRange?.minVariantPrice?.amount;
          return {
            ...hit,
            price: price || '0',
            image: hit.image ? {
              url: typeof hit.image === 'string' ? hit.image : hit.image.url || '/images/placeholder.jpg',
              alt: hit.title || 'Product image'
            } : null
          };
        })
      };
    })
    .catch(error => {
      console.error('Products search error:', error);
      return { hits: [] };
    });
  }
};

const collectionsIndex = {
  search: (query: string) => {
    console.log('Initiating collections search:', query);
    return searchClient.search([{
      indexName: 'shopify_collections',
      query,
      params: {
        query,
        attributesToRetrieve: [
          'objectID',
          'title',
          'handle',
          'image',
          'description',
          'products_count',
          'id'
        ],
        filters: 'products_count > 0',
        hitsPerPage: 4
      }
    }])
    .then(response => {
      console.log('Collections search response:', response);
      const result = response.results[0];
      return {
        ...result,
        hits: result.hits.map(hit => ({
          ...hit,
          id: hit.objectID,
          image: hit.image ? {
            url: typeof hit.image === 'string' ? hit.image : hit.image.url || '/images/placeholder.jpg',
            alt: hit.title || 'Collection image'
          } : null
        }))
      };
    })
    .catch(error => {
      console.error('Collections search error:', error);
      return { hits: [] };
    });
  }
};

export { searchClient, productsIndex, collectionsIndex }; 