class MersenneTwister {
  constructor(seed) {
    if (seed === undefined) {
      seed = new Date().getTime();
    }

    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df;
    this.UPPER_MASK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;

    this.mt = new Array(this.N);
    this.mti = this.N + 1;

    if (seed.constructor === Array) {
      this.init_by_array(seed, seed.length);
    } else {
      this.init_seed(seed);
    }
  }

  init_seed(s) {
    this.mt[0] = s >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti += 1) {
      const value = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] = (((((value & 0xffff0000) >>> 16) * 1812433253) << 16) + (value & 0x0000ffff) * 1812433253) + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  }

  init_by_array(initKey, keyLength) {
    let i = 1;
    let j = 0;
    let k = this.N > keyLength ? this.N : keyLength;

    this.init_seed(19650218);
    for (; k; k -= 1) {
      const value = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((value & 0xffff0000) >>> 16) * 1664525) << 16) + ((value & 0x0000ffff) * 1664525))) + initKey[j] + j;
      this.mt[i] >>>= 0;
      i += 1;
      j += 1;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
      if (j >= keyLength) {
        j = 0;
      }
    }

    for (k = this.N - 1; k; k -= 1) {
      const value = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((value & 0xffff0000) >>> 16) * 1566083941) << 16) + (value & 0x0000ffff) * 1566083941)) - i;
      this.mt[i] >>>= 0;
      i += 1;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
    }

    this.mt[0] = 0x80000000;
  }

  random_int() {
    let y;
    const mag01 = [0x0, this.MATRIX_A];

    if (this.mti >= this.N) {
      let kk;

      if (this.mti === this.N + 1) {
        this.init_seed(5489);
      }

      for (kk = 0; kk < this.N - this.M; kk += 1) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      for (; kk < this.N - 1; kk += 1) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
      this.mti = 0;
    }

    y = this.mt[this.mti++];

    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    return y >>> 0;
  }

  random_int31() {
    return this.random_int() >>> 1;
  }

  random_incl() {
    return this.random_int() * (1.0 / 4294967295.0);
  }

  random() {
    return this.random_int() * (1.0 / 4294967296.0);
  }

  random_excl() {
    return (this.random_int() + 0.5) * (1.0 / 4294967296.0);
  }

  random_long() {
    const a = this.random_int() >>> 5;
    const b = this.random_int() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }
}

export default MersenneTwister;