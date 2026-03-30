/**
 * Default decision tree for market categorization.
 * Encodes the Federation × DC matrix with GDP as tiebreaker.
 *
 * Archetype definitions:
 *   Dallas  (Clean/Scalable)      = No federation + Strong DC
 *   Atlanta (Federated/Complex)   = Federation presence + DC overlap
 *   Phoenix (White Space/Incubation) = Limited both + High GDP growth
 *
 * Matrix:
 *              | Low DC (0) | Med DC (1) | High DC (≥2)
 *   High Fed   |  Atlanta   |  Atlanta   |  Atlanta
 *   Med Fed    |  Phoenix   |  GDP→      |  Atlanta
 *   No Fed     |  GDP→      |  GDP→      |  Dallas
 *
 * GDP decides: ≥3% → Phoenix (incubation), <3% → context fallback
 */
const DEFAULT_TREE = {
  id: 'root',
  type: 'decision',
  field: 'federationCount',
  label: 'Federation Presence',
  branches: [
    // ─── High Federation (≥3) → Always Atlanta ───
    {
      operator: 'gte',
      value: 3,
      label: '≥ 3 (Strong)',
      child: {
        id: 'leaf-atlanta-high-fed',
        type: 'leaf',
        archetype: 'Atlanta',
        color: '#28a745',
      },
    },
    // ─── Medium Federation (1-2) → Depends on DC ───
    {
      operator: 'between',
      value: [1, 2],
      label: '1–2 (Medium)',
      child: {
        id: 'med-fed-dc',
        type: 'decision',
        field: 'dcCount',
        label: 'DC Coverage',
        branches: [
          {
            operator: 'gte',
            value: 2,
            label: '≥ 2 (Strong)',
            child: {
              id: 'leaf-atlanta-overlap',
              type: 'leaf',
              archetype: 'Atlanta',
              color: '#28a745',
            },
          },
          {
            operator: 'eq',
            value: 1,
            label: '= 1 (Medium)',
            child: {
              id: 'med-fed-med-dc-gdp',
              type: 'decision',
              field: 'projectedGdpGrowth',
              label: 'GDP Growth',
              branches: [
                {
                  operator: 'gte',
                  value: 3,
                  label: '≥ 3% (High)',
                  child: {
                    id: 'leaf-phoenix-medfed-meddc',
                    type: 'leaf',
                    archetype: 'Phoenix',
                    color: '#fd7e14',
                  },
                },
                {
                  operator: 'lt',
                  value: 3,
                  label: '< 3% (Low)',
                  child: {
                    id: 'leaf-atlanta-leaning',
                    type: 'leaf',
                    archetype: 'Atlanta',
                    color: '#28a745',
                  },
                },
              ],
            },
          },
          {
            operator: 'eq',
            value: 0,
            label: '= 0 (None)',
            child: {
              id: 'leaf-phoenix-medfed-nodc',
              type: 'leaf',
              archetype: 'Phoenix',
              color: '#fd7e14',
            },
          },
        ],
      },
    },
    // ─── No Federation (0) → Depends on DC ───
    {
      operator: 'eq',
      value: 0,
      label: '= 0 (None)',
      child: {
        id: 'no-fed-dc',
        type: 'decision',
        field: 'dcCount',
        label: 'DC Coverage',
        branches: [
          {
            operator: 'gte',
            value: 2,
            label: '≥ 2 (Strong)',
            child: {
              id: 'leaf-dallas-clean',
              type: 'leaf',
              archetype: 'Dallas',
              color: '#007bff',
            },
          },
          {
            operator: 'eq',
            value: 1,
            label: '= 1 (Medium)',
            child: {
              id: 'nofed-meddc-gdp',
              type: 'decision',
              field: 'projectedGdpGrowth',
              label: 'GDP Growth',
              branches: [
                {
                  operator: 'gte',
                  value: 3,
                  label: '≥ 3% (High)',
                  child: {
                    id: 'leaf-phoenix-nofed-meddc',
                    type: 'leaf',
                    archetype: 'Phoenix',
                    color: '#fd7e14',
                  },
                },
                {
                  operator: 'lt',
                  value: 3,
                  label: '< 3% (Low)',
                  child: {
                    id: 'leaf-dallas-leaning',
                    type: 'leaf',
                    archetype: 'Dallas',
                    color: '#007bff',
                  },
                },
              ],
            },
          },
          {
            operator: 'eq',
            value: 0,
            label: '= 0 (None)',
            child: {
              id: 'nofed-nodc-gdp',
              type: 'decision',
              field: 'projectedGdpGrowth',
              label: 'GDP Growth',
              branches: [
                {
                  operator: 'gte',
                  value: 3,
                  label: '≥ 3% (High)',
                  child: {
                    id: 'leaf-phoenix-whitespace',
                    type: 'leaf',
                    archetype: 'Phoenix',
                    color: '#fd7e14',
                  },
                },
                {
                  operator: 'lt',
                  value: 3,
                  label: '< 3% (Low)',
                  child: {
                    id: 'leaf-uncategorized',
                    type: 'leaf',
                    archetype: 'Uncategorized',
                    color: '#6c757d',
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

export default DEFAULT_TREE;
